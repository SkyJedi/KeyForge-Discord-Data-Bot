const cards = require('../card_data/');
const all_cards = require('../card_data/all_cards');
const new_cards = require('../card_data/new_cards');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const deckSearchAPI = require('../config').deckSearchAPI;
const kfcAPI = require('../config').kfcAPI;
const dokAPI = require('../config').dokAPI;
const randomAPI = require('../config').randomAPI;
const dokKey = require('../config').dokKey;
const KFCAuth = require('../config').KFCAuth;
const langs = require('../card_data').langs;
const sets = require('../card_data').sets;

const fetchDeck = (name) => {
	return new Promise(resolve => {
		axios.get(encodeURI(deckSearchAPI + '?search=' + name))
			.then(async response => {
				const deck = _.get(response, 'data.data[0]', false);
				deck.cards = await buildCardList(_.get(deck, 'cards', []), _.get(deck, 'id', ''));
				resolve(deck);
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
	return new Promise(async resolve => {
		const cards = await cardList.map(async card => {
			const data = all_cards.find(o => o.id === card);
			return data ? data : await fetchUnknownCard(card, id).catch(console.error);
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

// const fetchRandomDecks = (set) => {
// 	return new Promise(resolve => {
// 		let randomPage = _.random(0, set ? (set === 341 ? 94200 : 19999) : 114000);
// 		console.log(set, randomPage)
// 		const url = `${deckSearchAPI}?page=${randomPage}${set ? `&expansion=${set}`: ''}`
// 		console.log(url)
// 		axios.get(encodeURI(url))
// 			.then(async response => {
// 				const randomDeck = response.data.data.length-1;
// 				console.log(randomDeck)
// 				const deck = _.get(response, `data.data[${_.random(0, randomDeck)}`, false);
// 				deck.cards = await buildCardList(_.get(deck, 'cards', []), _.get(deck, 'id', ''));
// 				resolve(deck);
// 			}).catch(console.error);
// 	});
// };

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
							sasRating
						} = response.data.deck,
						sas = `${sasRating} SAS • ${A + E + R + C + D + (P / 10)} AERC`,
						deckAERC = `A: ${A} • E: ${E} • R: ${R} • C: ${C} • D: ${D} • P: ${P}`;
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
			}).catch(console.error);
	});
};

const getFlagSet = (flags) => {
	const final = _.filter(sets, set => flags.includes(set.flag.toLowerCase()));
	return _.get(final, '[0].set_number');
};

const getFlagLang = (flags) => {
	const final = _.filter(flags, flag => langs.includes(flag));
	return _.get(final, '[0]', 'en');
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