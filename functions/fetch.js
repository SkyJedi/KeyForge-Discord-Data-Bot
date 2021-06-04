const axios = require('axios');
const { fabric } = require('fabric');
const Fuse = require('fuse.js');
const levenshtein = require('js-levenshtein');
const db = require('./firestore');
const { v4: uuid } = require('uuid');
const { get, filter, findIndex, sortBy, round, uniqBy, find, sample } = require('lodash');

const { deckSearchAPI, dokAPI, dokKey, aaAPI, aaConfigFaq, aaConfigSpoiler, imageCDN } = require('../config');
const { langs, sets, houses, cardTypes, deckIdRegex, erratas, timing } = require('../card_data');

const loadImage = (imgPath) => {
    return new Promise((resolve, reject) => {
        fabric.util.loadImage(imageCDN + imgPath, image => {
            image ? resolve(new fabric.Image(image)) : reject();
        });
    });
};

const fetchDeck = (params) => new Promise((resolve, reject) => {
    const data = params.map(param => deckIdRegex.test(param) ? fetchDeckId(param.match(deckIdRegex)[0]) : fetchDeckNameMV(param));
    Promise.all(data).then(data => resolve(data)).catch(() => reject());
});

const fetchDeckId = async (id) => {
    const doc = await db.collection('decks').doc(id).get();
    if (doc.exists) {
        const deck = doc.data();
        deck.houses = get(deck, '_links.houses');
        if (deck.cards.every(x => typeof x === 'string' || x instanceof String)) {
            const { cards, enhancements } = await buildCardList(deck);
            return { ...deck, cards, enhancements };
        }
    }
    console.info(`${id} is not in DB, fetching from the man`);
    return await fetchDeckIdMV(id);
};

const fetchDeckIdMV = async (id) => {
    const response = await axios.get(encodeURI('http://www.keyforgegame.com/api/decks/' + id));
    let deck = get(response, 'data.data', false);
    if (deck) {
        await db.collection('decks').doc(deck.id).set(deck);
        deck.houses = get(deck, '_links.houses');
        deck = await buildCardList(deck);
    }

    return deck;
};

const fetchDeckNameMV = async (name) => {
    const response = await axios.get(encodeURI(deckSearchAPI + '?search=' + name.split(' ').join('+')));

    let batch = db.batch();
    response.data.data.forEach(x => batch.set(db.collection('decks').doc(x.id), x));
    batch.commit().catch(console.error);

    const index = findIndex(response.data.data, x => x.name.toLowerCase() === name);
    let deck = Object.assign({}, get(response, `data.data[${Math.max(index, 0)}]`, false));
    if (deck) {
        deck.houses = get(deck, '_links.houses');
        deck = await buildCardList(deck);
        return (deck);
    }
};

const buildEnhancements = (cards) => {
    let enhancements = {};
    if (cards.every(x => !x.is_enhanced)) return { cards, enhancements: false };
    for (const card of cards) {
        if (card.card_text.startsWith('Enhance ')) {
            let text = card.card_text.split(' ')[1].replace('.', '').split('');
            for (const x of text) {
                let type;
                switch (x) {
                    case 'P':
                        break;
                    case 'A':
                    case '\uf360':
                        type = 'aember';
                        break;
                    case 'T':
                    case '\uf565':
                        type = 'capture';
                        break;
                    case 'D':
                    case '\uf361':
                        type = 'damage';
                        break;
                    case 'R':
                    case '\uf36e':
                        type = 'draw';
                        break;
                    default:
                        break;
                }
                if (type) {
                    enhancements[type] = enhancements[type] ? enhancements[type] + 1 : 1;
                }
            }
        }
    }

    let totalEnhancements = Object.keys(enhancements).reduce((a, b) => a + enhancements[b], 0);
    let totalEnhancedCards = cards.filter(x => x.is_enhanced).length;
    let types = Object.keys(enhancements);

    if (totalEnhancements === totalEnhancedCards && types.length === 1) {
        for (const [index, card] of cards.entries()) {
            if (card.is_enhanced) cards[index] = { ...card, enhancements: types };
        }
        enhancements = false;
    } else if (totalEnhancedCards === 1) {
        let pips = [];
        for (const type in enhancements) {
            for (let x = 0; x < enhancements[type]; x++) {
                pips.push(type);
            }
        }
        for (const [index, card] of cards.entries()) {
            if (card.is_enhanced) cards[index] = { ...card, enhancements: pips.sort() };
        }
        enhancements = false;
    }

    return { cards, enhancements };
};

const buildCardList = async (deck) => {
    const cardRefs = deck.cards.map(card => db.collection('AllCards').doc(card));
    let fullCards = [];
    const docs = await db.runTransaction(transaction => transaction.getAll(...cardRefs));
    for (const doc of docs) {
        if (doc.exists) {
            let card = doc.data();
            card.is_legacy = deck.set_era_cards.Legacy.includes(card.id);
            card.is_non_deck = !!card.is_non_deck;
            fullCards.push(card);
        }
    }

    let { cards, enhancements } = buildEnhancements(fullCards);
    cards = sortBy(cards, ['house', 'card_number']);
    cards = sortBy(cards, 'is_non_deck');
    return { ...deck, cards, enhancements };
};


const fetchMavCard = async (name, house) => {
    const snapshot = await db.collection('AllCards')
        .limit(1)
        .where('card_title', '==', name)
        .where('house', '==', house)
        .get();

    if (snapshot.size > 0) return snapshot.docs[0].data();
};

const fetchDeckWithCard = async (cardId, flags) => {
    const expansion = getFlagSet(flags);
    let decksRef = db.collection('decks').limit(10)
        .where('cards', 'array-contains', cardId);

    if (expansion) decksRef = decksRef.where('expansion', '==', expansion);

    const snapshot = await decksRef.get();
    if (snapshot.size > 0) {
        let deck = sample(snapshot.docs).data();
        deck.houses = get(deck, '_links.houses');
        return await buildCardList(deck);
    }
};

const fetchRandomDecks = async ({ expansion, houses = [] }) => {
    const key = uuid();
    let decksRef = db.collection('decks').limit(1);
    if (expansion) decksRef = decksRef.where('expansion', '==', expansion);
    if (houses.length > 0) {
        if (houses.length === 3) decksRef = decksRef.where('_links.houses', '==', houses);
        else decksRef = decksRef.where('_links.houses', 'array-contains', sample(houses));
    }
    let snapshot = await decksRef.where('id', '>=', key).get();
    if (snapshot.size === 0) {
        snapshot = await decksRef.where('id', '<', key).get();
    }
    const deck = snapshot.docs[0].data();
    deck.houses = get(deck, '_links.houses');
    const { cards, enhancements } = await buildCardList(deck);
    return { ...deck, cards, enhancements };
};

const fetchDoK = async (deckID) => {
    const response = await axios.get(`${dokAPI}${deckID}`, dokKey);
    if (response.data) {
        const { sasRating = false, sasPercentile = false } = response.data.deck;
        if (sasRating && sasPercentile) {
            return ({ sas: `${round(sasRating, 2)} SAS`, sasStar: sasStarRating(sasPercentile) });
        }
    }
};

const sasStarRating = (x) => {
    switch (true) {
        case (x >= 99.99):
            return '✮✮✮✮✮';
        case (x >= 99.9):
            return '★★★★★';
        case (x >= 99):
            return '★★★★½';
        case (x >= 90):
            return '★★★★';
        case (x >= 75):
            return '★★★½';
        case (x >= 25):
            return '★★★';
        case (x >= 10):
            return '★★½';
        case (x >= 1):
            return '★★';
        case (x >= 0.1):
            return '★½';
        case (x >= 0.01):
            return '★';
        case (x > 0):
            return '½';
        default:
            return 'No Star Rating';
    }
};

const fetchCard = (search, flags = []) => {
    const set = getFlagSet(flags);
    const lang = getFlagLang(flags);
    const house = getFlagHouses(flags).shift();
    const options = {
        shouldSort: true,
        tokenize: true,
        matchAllTokens: true,
        includeScore: true,
        threshold: 0.2,
        keys: [
            {
                name: 'card_number',
                weight: 0.3
            }, {
                name: 'card_title',
                weight: 0.7
            }]
    };
    let cards = (set ? require(`../card_data/${lang}/${set}`) : require(`../card_data/`)[lang]);

    if (house) {
        cards = cards.filter(x => x.house === house);
    }

    if (search.includes('evil twin')) {
        search = search.replace('evil twin', '').trim();
        flags = flags.concat('et');
    }
    const fuse = new Fuse(cards, options);
    let results = fuse.search(search)
    if (0 >= results.length) return;
    results = results.filter(result => result.score === results[0].score);
    results = results.map(result => {
        result.score = levenshtein(result.item.card_title, search);
        return result;
    });
    results = sortBy(results, ['score']);
    let final = get(results, '[0].item');
    if (final) {
        final = cards.filter(x => x.card_title === final.card_title);
        if (flags.includes('et')) {
            final = final.filter(x => x.rarity === 'Evil Twin');
        }
        final = sortBy(final, 'expansion').reverse()[0];
    }
    return final;
};

const fetchReprints = (card, flags) => {
    const lang = getFlagLang(flags);
    const cards = require(`../card_data/`)[lang];
    return uniqBy(cards.filter(x => x.card_title === card.card_title && x.rarity === card.rarity), 'card_number');
};

const fetchErrata = (card) => {
    return find(erratas, ['card_title', card.card_title]);
};

const fetchText = (search, flags, type = 'card_text') => {
    const set = getFlagSet(flags);
    const lang = getFlagLang(flags);
    const cardType = getFlagCardType(flags);
    const number = getFlagNumber(flags);
    search = search.trim();
    let cards = (set ? require(`../card_data/${lang}/${set}`) : require(`../card_data/`)[lang]);
    let searchCards = [];
    for (const card of cards) {
        if (!searchCards.some(x => x.card_title === card.card_title && x.rarity === card.rarity)) {
            searchCards.push(card);
        }
    }
    cards = searchCards;
    switch (type) {
        case 'traits':
            cards = cards.filter(card => card[type] && card[type].split(' • ')
                .some(x => x.toLowerCase().includes(search)));
            break;
        default:
            cards = cards.filter(card => card[type].toLowerCase().includes(search));
            break;
    }
    if (cardType) cards = cards.filter(x => x.card_type === cardType);
    if (number) cards = cards.filter(x => x.traits && x.traits.split('•').length === number);
    return sortBy(cards, ['card_title']);
};

const fetchFAQ = async (card) => {
    aaConfigFaq.params.where = `((RulesPages IS NULL AND RulesText like '%${card.card_title}%') OR (RulesPages IS NOT NULL AND RulesPages LIKE '%•${card.card_title}•%')) AND (RulesType='FFGRuling' OR RulesType='FAQ' OR RulesType='Commentary' OR RulesType='OutstandingIssues')`;
    const response = await axios.get(aaAPI, aaConfigFaq);
    if (response.data) {
        return response.data.cargoquery;
    }
};

const fetchSpoiler = async (search) => {
    aaConfigSpoiler.params.where = `(Name LIKE '%${search}%')`;
    const response = await axios.get(aaAPI, aaConfigSpoiler);
    if (response.data) {
        return response.data.cargoquery;
    }
};

const fetchTiming = (text) => {
    console.log(text)
    const options = {
        shouldSort: true,
        tokenize: true,
        matchAllTokens: true,
        includeScore: true,
        threshold: 0.3,
        keys: [
            { name: 'phase', weight: 0.9 },
            { name: 'steps', weight: 0.1 }
        ]
    };
    const fuse = new Fuse(timing, options);
    let results = fuse.search(text);
    results = results.map(result => {
        result.score = result.item.phase.split(' ').map(x => {
            return levenshtein(x, text);
        }).sort()[0];
        return result;
    });

    results = sortBy(results, 'score');

    return results.map(item => item.item)[0];
};

const getCardLink = (card) => {
    const AllCards = require(`../card_data/en/${card.expansion}`);
    card = AllCards.find(x => x.card_number === card.card_number);
    return encodeURI(`https://archonarcana.com/${card.card_title.replace(/\s+/g, '_')
        .replace(/[\[\]']+/g, '')}${card.rarity === 'Evil Twin' ? '_(Evil_Twin)' : ''}?powered_by=archonMatrixDiscord`);
};
const getCardLinkDoK = (card) => {
    const AllCards = require(`../card_data/en/${card.expansion}`);
    card = AllCards.find(x => x.card_number === card.card_number);
    return encodeURI(`https://decksofkeyforge.com/cards/${card.card_title.replace(/\s+/g, '-').toLowerCase()
        .replace(/[\[\]Ææ']+/g, '')}?powered_by=archonMatrixDiscord`);
};
const getFlagCardType = (flags = []) => get(filter(cardTypes, cardType => flags.includes(cardType.toLowerCase())), '[0]');
const getFlagSet = (flags = []) => get(filter(sets, set => flags.includes(set.flag.toLowerCase())), '[0].set_number');
const getSet = (number = []) => get(sets.filter(set => number === set.set_number), '[0].flag', 'ERROR');
const getFlagHouses = (flags = []) => flags.filter(x => Object.keys(houses).includes(x)).map(x => houses[x]).sort();
const getFlagLang = (flags = []) => get(filter(flags, flag => langs.includes(flag)), '[0]', 'en');
const getFlagNumber = (
    flags = [], defaultNumber = 0) => +(get(filter(flags, flag => Number.isInteger(+flag)), '[0]', defaultNumber));

const format = (text) => text.replace(/<I>/gi, '*').replace(/<B>/gi, '**');

module.exports = {
    buildCardList,
    fetchCard,
    fetchDeck,
    fetchDeckWithCard,
    fetchDoK,
    fetchErrata,
    fetchFAQ,
    fetchMavCard,
    fetchRandomDecks,
    fetchReprints,
    fetchSpoiler,
    fetchText,
    fetchTiming,
    format,
    getCardLink,
    getCardLinkDoK,
    getFlagHouses,
    getFlagLang,
    getFlagNumber,
    getFlagSet,
    getSet,
    loadImage,
};
