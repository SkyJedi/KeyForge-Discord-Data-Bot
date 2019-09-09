const cards = require('../card_data/');
const all_cards = require('../card_data/all_cards');
const new_cards = require('../card_data/new_cards');
const faq = require('../card_data/faq');
const axios = require('axios');
const fs = require('fs');
const {get, filter} = require('lodash');
const path = require('path');
const {deckSearchAPI, dokAPI, randomAPI, dokKey} = require('../config');
const {langs, sets} = require('../card_data');

const fetchDeck = (name, lang = 'en') => {
	return new Promise(resolve => {
		axios.get(encodeURI(deckSearchAPI + '?search=' + name), {headers: {'Accept-Language': lang}})
			.then(async response => {
				const deck = get(response, 'data.data[0]', false);
				deck.cards = await buildCardList(get(deck, 'cards', []), deck);
				deck.houses = deck._links.houses;
				deck.cardList = deck._links.cards;
				resolve(deck);
			}).catch(console.error);
	});
};

const fetchDeckBasic = (id) => {
	return new Promise(resolve => {
		axios.get(encodeURI(deckSearchAPI + id))
			.then(async response => {
				const deck = get(response, 'data.data', false);
				deck.houses = deck._links.houses;
				deck.cardList = deck._links.cards;
				deck.cards = await buildCardList(get(deck, 'cards', []), deck);
				resolve(deck);
			}).catch(console.error);
	});
};

const buildCardList = (cardList, deck) => {
	return new Promise(async resolve => {
		const cards = await cardList.map(async card => {
			let data = all_cards.find(o => o.id === card);
			if (!data) data = await fetchUnknownCard(card, deck.id).catch(console.error);
			data.is_legacy = get(deck, 'set_era_cards.Legacy', []).includes(card.id);
			return data;
		});
		Promise.all(cards).then(cards => resolve(cards));
	});
};

const fetchCard = (search, flags) => {
	const set = getFlagSet(flags),
		lang = getFlagLang(flags);
	let final;
	final = cards[lang].find(card => card.card_title.toLowerCase() === search && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_title.toLowerCase().startsWith(search) && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_title.toLowerCase().endsWith(search) && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => +card.card_number === +search && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_title.toLowerCase().replace(/['"’`“”\d]/g, '').includes(search.replace(/['"’`“”\d]/g, '')) && (set ? card.expansion === set : true));
	return final;
};

const fetchUnknownCard = (cardId, deckId) => {
	return new Promise(async resolve => {
		console.log(`${cardId} not found, fetching from the man`);
		const fetchedCards = await axios.get(`http://www.keyforgegame.com/api/decks/${deckId}/?links=cards`);
		const card = fetchedCards.data._linked.cards.find(o => o.id === cardId);
		if (!new_cards.find(o => o.id === cardId)) {
			fs.writeFile(path.join(__dirname, '../card_data/new_cards.json'), JSON.stringify(new_cards.concat(card)), (err) => {
				if (err) throw err;
				console.log(`${cardId} has been added to new_cards.json`);
				resolve(card);
			});
		} else resolve(card);
	});
};

const fetchRandomDecks = () => {
	return new Promise(resolve => {
		axios.get(encodeURI(randomAPI))
			.then(response => resolve(response.data))
			.catch(() => resolve(false));
	});
};

const fetchDoK = (deckID) => {
	return new Promise(resolve => {
		axios.get(`${dokAPI}${deckID}`, dokKey)
			.then(response => {
				if (response.data) {
					const {
							amberControl: A, expectedAmber: E,
							artifactControl: R, creatureControl: C,
							deckManipulation: D, effectivePower: P,
							sasRating, sasPercentile
						} = response.data.deck,
						sas = `${sasRating} SAS • ${A + E + R + C + D + (P / 10)} AERC`,
						deckAERC = `A: ${A} • E: ${E} • R: ${R} • C: ${C} • D: ${D} • P: ${P}`,
						sasStar = sasStarRating(sasPercentile);
					resolve({sas, deckAERC, sasStar});
				} else resolve(['Unable to Retrieve SAS', 'Unable to Retrieve AERC']);
			}).catch(() => resolve(['Unable to Retrieve SAS, DoK non-responsive', 'Unable to Retrieve AERC, DoK non-responsive']));
	});
};

const fetchFAQ = (params) => {
	return faq.find(x => params.every(y => x.question.toLowerCase().includes(y.toLowerCase())));
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

const getFlagSet = (flags) => {
	const final = filter(sets, set => flags.includes(set.flag.toLowerCase()));
	return get(final, '[0].set_number');
};

const getFlagLang = (flags) => {
	const final = filter(flags, flag => langs.includes(flag));
	return get(final, '[0]', 'en');
};

const getFlagNumber = (flags, defaultNumber = 0) => {
	const final = +(get(filter(flags, flag => Number.isInteger(+flag)), '[0]'));
	if (final) return final;
	else return defaultNumber;
};

const format = (text) => {
	text = text.replace(/<I>/gi, "*");
	text = text.replace(/<B>/gi, "**");
	return text;
};
exports.fetchDeck = fetchDeck;
exports.fetchDeckBasic = fetchDeckBasic;
exports.fetchCard = fetchCard;
exports.fetchDoK = fetchDoK;
exports.fetchFAQ = fetchFAQ;
exports.fetchUnknownCard = fetchUnknownCard;
exports.fetchRandomDecks = fetchRandomDecks;
exports.getFlagLang = getFlagLang;
exports.getFlagSet = getFlagSet;
exports.getFlagNumber = getFlagNumber;
exports.format = format;