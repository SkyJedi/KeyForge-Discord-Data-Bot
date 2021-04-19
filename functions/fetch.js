const axios = require('axios');
const { fabric } = require('fabric');
const Fuse = require('fuse.js');
const levenshtein = require('js-levenshtein');
const db = require('./firestore');
const { v4: uuid } = require('uuid');
const { get, filter, findIndex, sortBy, round, shuffle, uniqBy, find } = require('lodash');

const { deckSearchAPI, dokAPI, dokKey, aaAPI, aaConfigFaq, aaConfigSpoiler, twilioAccountSid, twilioToken, twilioSender, twilioReceiver } = require('../config');
const { langs, sets, houses, cardTypes } = require('../card_data');
const erratas = require('../card_data/erratas.json');
const timing = require('../card_data/timing');
const twilio = require('twilio')(twilioAccountSid, twilioToken);
const deckIdRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
const { imageCDN } = require('../config');

const text = (msg) => twilio.messages.create({ from: twilioSender, to: twilioReceiver, body: msg });

const loadImage = (imgPath) => {
    return new Promise(resolve => fabric.Image.fromURL(imageCDN + imgPath, image => resolve(image)));
};

const fetchDeck = (params) => new Promise((resolve, reject) => {
    const data = params.map(param => deckIdRegex.test(param) ? fetchDeckId(param.match(deckIdRegex)[0]) : fetchDeckNameMV(param));
    Promise.all(data).then(data => resolve(data)).catch(() => reject());
});
const fetchDeckId = (id) => new Promise((resolve, reject) => {
    db.collection('decks').doc(id).get().then(doc => {
        if (doc.exists) {
            const deck = doc.data();
            deck.houses = get(deck, '_links.houses');
            buildCardList(deck).then(cards => {
                deck.cards = cards;
                resolve(deck);
            });
        } else {
            console.log(`${id} is not in DB, fetching from the man`);
            fetchDeckIdMV(id).then(deck => resolve(deck)).catch(() => reject());
        }
    }).catch(() => reject());
});
const fetchDeckIdMV = (id) => new Promise((resolve, reject) => {
    axios.get(encodeURI(deckSearchAPI + id)).then(response => {
        const deck = get(response, 'data.data', false);
        if (deck) {
            db.collection('decks').doc(deck.id).set(deck).catch(console.error);
            deck.houses = get(deck, '_links.houses');
            buildCardList(deck).then(cards => {
                deck.cards = cards;
                resolve(deck);
            });
        } else reject();
    }).catch(() => reject());
});
const fetchDeckNameMV = (name) => new Promise((resolve, reject) => {
    axios.get(encodeURI(deckSearchAPI + '?search=' + name.split(' ').join('+'))).then(response => {
        const index = findIndex(response.data.data, x => x.name.toLowerCase() === name);
        const deck = get(response, `data.data[${Math.max(index, 0)}]`, false);
        if (deck) {
            deck.houses = get(deck, '_links.houses');
            buildCardList(deck).then(cards => {
                deck.cards = cards;
                resolve(deck);
            });
        } else reject();
        let batch = db.batch();
        response.data.data.forEach(x => batch.set(db.collection('decks').doc(x.id), x));
        batch.commit().catch(console.error);
    }).catch(() => reject());
});

const buildEnhancements = (deck) => {
    if (deck.cards.every(x => !x.is_enhanced)) return false;
    const enhancements = { aember: 0, capture: 0, damage: 0, draw: 0 };
    deck.cards.forEach(card => {
        if (card.card_text.startsWith('Enhance ')) {
            let text = card.card_text.split(' ')[1].replace('.', '').split('');
            text.forEach(x => {
                switch (x) {
                    case 'P':
                        break;
                    case 'A':
                    case '\uf360':
                        enhancements.aember++;
                        break;
                    case 'T':
                    case '\uf565':
                        enhancements.capture++;
                        break;
                    case 'D':
                    case '\uf361':
                        enhancements.damage++;
                        break;
                    case 'R':
                    case '\uf36e':
                        enhancements.draw++;
                        break;
                    default:
                        break;
                }
            });
        }
    });
    return enhancements;
};
const buildCardList = (deck) => new Promise(resolve => {
    const cardRefs = deck.cards.map(card => db.collection('AllCards').doc(card));
    return db.runTransaction(transaction => {
        return transaction.getAll(...cardRefs).then(docs => {
            let list = [];
            for (let x = 0; x < docs.length; x++) {
                if (docs[x].exists) {
                    let card = docs[x].data();
                    card.is_legacy = deck.set_era_cards.Legacy.includes(card.id);
                    list.push(card);
                } else {
                    if (deck.id) {
                        fetchUnknownCard(deck.cards[x], deck.id).then(unknownCard => {
                            unknownCard.is_legacy = deck.set_era_cards.Legacy.includes(unknownCard.id);
                            list.push(unknownCard);
                        });
                    }
                }
            }
            resolve(sortBy(list, ['house', 'card_number']));
        });
    });
});
const fetchUnknownCard = (cardId, deckId) => new Promise(resolve => {
    console.log(`${cardId} not found, fetching from the man`);
    axios.get(`http://www.keyforgegame.com/api/decks/${deckId}/?links=cards`).then(fetchedCards => {
        const card = fetchedCards.data._linked.cards.find(o => o.id === cardId);
        resolve(card);
        db.collection('AllCards').doc(card.id).set(card).then(() => {
            console.log(`${card.id} has been added to firestore`);
            text(`${card.card_title} in House ${card.house} had been found! https://www.keyforgegame.com/deck-details/${deckId}/`);
        });
    });
});
const fetchMavCard = (name, house) => new Promise((resolve, reject) => {
    db.collection('AllCards')
        .limit(1)
        .where('card_title', '==', name)
        .where('house', '==', house)
        .get()
        .then(snapshot => {
            if (snapshot.size > 0) snapshot.forEach(doc => resolve(doc.data()));
            else reject();
        })
        .catch(() => reject());
});
const fetchDeckWithCard = (cardId) => new Promise((resolve, reject) => {
    db.collection('decks').limit(10).where('cards', 'array-contains', cardId).get().then(snapshot => {
        if (snapshot.size > 0) {
            let deck = [];
            snapshot.forEach(doc => deck.push(doc.data()));
            deck = shuffle(deck)[0];
            deck.houses = get(deck, '_links.houses');
            buildCardList(deck).then(cards => {
                deck.cards = cards;
                resolve(deck);
            });
        } else reject();
    }).catch(() => reject());
});
const fetchRandomDecks = ({ expansion, houses = [] }) => new Promise((resolve, reject) => {
    const key = uuid();
    let decksRef = db.collection('decks').limit(1);
    if (expansion) decksRef = decksRef.where('expansion', '==', expansion);
    if (houses.length > 0) {
        if (houses.length === 3) decksRef = decksRef.where('_links.houses', '==', houses);
        else decksRef = decksRef.where('_links.houses', 'array-contains-any', houses);
    }
    decksRef.where('id', '>=', key).get().then(snapshot => {
        if (snapshot.size > 0) snapshot.forEach(doc => resolve(doc.data()));
        else {
            decksRef.where('id', '<', key).get().then(snapshot => {
                if (snapshot.size > 0) snapshot.forEach(doc => resolve(doc.data()));
                else resolve(false);
            }).catch(err => {
                console.error(err);
                reject();
            });
        }
    }).catch(err => {
        console.error(err);
        reject();
    });
});

const fetchDoK = (deckID) => {
    return new Promise(resolve => {
        axios.get(`${dokAPI}${deckID}`, dokKey).then(response => {
            if (response.data) {
                const { sasRating = 0, sasPercentile = 0 } = response.data.deck,
                    sas = `${round(sasRating, 2)} SAS`,
                    sasStar = sasStarRating(sasPercentile);
                resolve({ sas, sasStar });
            } else resolve({ sas: 'Unable to Retrieve SAS', sasStar: 'Unable to Retrieve sasStars' });
        }).catch(() => resolve({ sas: 'Unable to Retrieve SAS', sasStar: 'Unable to Retrieve sasStars' }));
    });
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
    const house = getFlagHouse(flags);
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

    if (house.length > 0) {
        cards = cards.filter(x => x.house === house);
    }

    if (search.includes('evil twin')) {
        search = search.replace('evil twin', '').trim();
        flags = flags.concat('et');
    }

    const fuse = new Fuse(cards, options);
    let results = fuse.search(search);
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
    return uniqBy(cards.filter(x => x.card_title === card.card_title), 'card_number');
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

const fetchFAQ = (card) => {
    return new Promise(resolve => {
        aaConfigFaq.params.where = `((RulesPages IS NULL AND RulesText like '%${card.card_title}%') OR (RulesPages IS NOT NULL AND RulesPages LIKE '%•${card.card_title}•%')) AND (RulesType='FFGRuling' OR RulesType='FAQ' OR RulesType='Commentary' OR RulesType='OutstandingIssues')`;
        axios.get(aaAPI, aaConfigFaq).then(response => {
            if (response.data) {
                resolve(response.data.cargoquery);
            } else resolve(null);
        });
    });
};

const fetchSpoiler = (search) => {
    return new Promise(resolve => {
        aaConfigSpoiler.params.where = `(Name LIKE '%${search}%')`;
        axios.get(aaAPI, aaConfigSpoiler).then(response => {
            if (response.data) {
                resolve(response.data.cargoquery);
            } else resolve(null);
        });
    });
};

const fetchTiming = (text) => {
    const options = {
        shouldSort: true,
        tokenize: true,
        matchAllTokens: true,
        includeScore: true,
        threshold: 0.3,
        keys: [
            { name: 'phase', weight: 0.9 },
            { name: 'steps', weight: 0.4 }
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

const fetchServerLanguage = (message, client) => new Promise((resolve, reject) => {
    db.collection('Bots')
        .doc(`${client.user.username}_Discord`)
        .collection(message.channel.id)
        .doc('language')
        .get()
        .then(doc => {
            if (doc.exists) {
                resolve(doc.data().language);
            } else resolve('en');
        })
        .catch(err => reject(err));
});

const setServerLanguage = (message, client, flags) => new Promise((resolve, reject) => {
    const language = getFlagLang(flags);
    db.collection('Bots')
        .doc(`${client.user.username}_Discord`)
        .collection(message.channel.id)
        .doc('language')
        .set({ language })
        .then(() => resolve())
        .catch(err => reject(err));
});

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
const getFlagHouse = (flags = []) => get(flags.filter(x => Object.keys(houses).includes(x)).map(x => houses[x])
    .sort(), '[0]', []);
const getFlagLang = (flags = []) => get(filter(flags, flag => langs.includes(flag)), '[0]', 'en');
const getFlagNumber = (
    flags = [], defaultNumber = 0) => +(get(filter(flags, flag => Number.isInteger(+flag)), '[0]', defaultNumber));

const format = (text) => text.replace(/<I>/gi, '*').replace(/<B>/gi, '**');

module.exports = {
    buildEnhancements,
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
    fetchServerLanguage,
    fetchSpoiler,
    fetchText,
    fetchTiming,
    fetchUnknownCard,
    format,
    getCardLink,
    getCardLinkDoK,
    getFlagHouse,
    getFlagLang,
    getFlagNumber,
    getFlagSet,
    getSet,
    loadImage,
    setServerLanguage
};
