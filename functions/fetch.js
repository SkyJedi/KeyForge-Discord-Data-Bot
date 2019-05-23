const cards = require('../data/');
const new_cards = require('../data/new_cards');
const all_cards = require('../data/all_cards');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const path = require('../config').path;
const deckSearchAPI = require('../config').deckSearchAPI;
const kfcAPI = require('../config').kfcAPI;
const dokAPI = require('../config').dokAPI;
const KFCAuth = require('../config').KFCAuth;

const fetchDeck = (name) => {
	return new Promise(resolve => {
		axios.get(encodeURI(deckSearchAPI + '?search=' + name))
			.then(async response => {
				const deck = _.get(response, 'data.data[0]', false);
				const cards = await buildCardList(_.get(deck, 'cards', []), _.get(deck, 'id', ''));
				resolve([deck, cards]);
			}).catch(console.error);
	});
};

const fetchDeckBasic = (id) => {
	return new Promise(resolve => {
		axios.get(encodeURI(deckSearchAPI + id))
			.then(async response => {
				const deck = _.get(response, 'data.data', false);
				deck.cards = await buildCardList(_.get(deck, 'cards', []), _.get(deck, 'id', ''));
				resolve(deck);
			}).catch(console.error);
	});
};

const buildCardList = (cardList, id) => {
	return new Promise(resolve => {
		const cards = cardList.map(async card => {
			const data = all_cards.find(o => o.id === card);
			return data ? data : await fetchUnknownCard(card, id).catch(console.error);
		});
		Promise.all(cards).then(cards => resolve(cards))
	});
};

const fetchCard = (name, lang, set) => {
	let final;
	final = cards[lang].find(card => card.card_title.toLowerCase() === name && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_title.toLowerCase().startsWith(name) && (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_title.toLowerCase().endsWith(name)&& (set ? card.expansion === set : true));
	if (final) return final;
	final = cards[lang].find(card => card.card_number === name && (set ? card.expansion === set : true));
	return final;
};

const fetchUnknownCard = async (cardId, deckId) => {
	console.log(`${cardId} not found, fetching from the man from deck ${deckId}`);
	const fetchedCards = await axios.get(`${deckSearchAPI}${deckId}/?links=cards`);
	const card = fetchedCards.data._linked.cards.find(o => o.id === cardId);
	if (!new_cards.find(o => o.id === cardId)) {
		fs.writeFile(`${path}/data/new_cards.json`, JSON.stringify(new_cards.concat(card)), (err) => {
			if (err) throw err;
			console.log(`${cardId} has been added to new_cards.json`);
		});
	}
	return card;
};

const fetchDeckADHD = (deckID) => {
	return new Promise(resolve => {
		const aveADHD = {a_rating: 17.57, b_rating: 18.28, e_rating: 7.58, c_rating: 5.51};
		axios.get(`${kfcAPI}decks/${deckID}.json`, KFCAuth)
			.then(response => {
				if (response.data) {
					resolve(`${Object.keys(aveADHD).sort().map(type => `${_.toUpper(type.slice(0, 1))}: ${response.data[type].toFixed(1)} (${(response.data[type] - aveADHD[type]).toFixed(1)})`).join(' • ')}`);
				} else resolve(`ADHD unavailable, register https://keyforge-compendium.com/decks/${deckID}?powered_by=archonMatrixDiscord`);
			}).catch(() => resolve(`ADHD not Found! KFC is non-responsive`));
	});
};

const fetchRandomDecks = (amount) => {
	return new Promise(resolve => {
		axios.get(`${kfcAPI}decks/random/${amount}`, KFCAuth)
			.then(response => resolve(response.data))
			.catch(() => resolve(false));
	});
};

const fetchDoK = (deckID) => {
	return new Promise(resolve => {
		const aveAERC = {a_rating: 7, e_rating: 20, r_rating: 1, c_rating: 13};
		axios.get(`${dokAPI}${deckID}`)
			.then(response => {
				if (response.data) {
					const {amberControl: A, expectedAmber: E, artifactControl: R, creatureControl: C, sasRating} = response.data.deck,
						sas = `${sasRating} SAS`,
						deckAERC = `A: ${A} (${A - aveAERC.a_rating}) • E: ${E} (${E - aveAERC.e_rating}) • R: ${R} (${R - aveAERC.r_rating}) • C: ${C} (${C - aveAERC.c_rating})`;
					resolve({sas, deckAERC});
				} else resolve(['Unable to Retrieve SAS', 'Unable to Retrieve AERC']);
			}).catch(() => resolve(['Unable to Retrieve SAS, DoK non-responsive', 'Unable to Retrieve AERC, DoK non-responsive']));
	});
};

const fetchFAQ = (card_number, search) => {
	return new Promise(resolve => {
		axios.get(`${kfcAPI}cards/${card_number}.json`, KFCAuth)
			.then(response => {
				const data = _.get(response, 'data.faqs', []),
					final = data.map(faq => {
						const question = faq.question.toLowerCase();
						if (question === search || question.startsWith(search) || question.includes(search)) return faq;
					}).filter(Boolean);
				resolve(final);
			}).catch(console.error)
	});
};

exports.fetchDeck = fetchDeck;
exports.fetchDeckBasic = fetchDeckBasic;
exports.fetchCard = fetchCard;
exports.fetchDeckADHD = fetchDeckADHD;
exports.fetchDoK = fetchDoK;
exports.fetchFAQ = fetchFAQ;
exports.fetchUnknownCard = fetchUnknownCard;
exports.fetchRandomDecks = fetchRandomDecks;