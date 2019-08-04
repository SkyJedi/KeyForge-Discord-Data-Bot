const main = require('../index');
const fetchDeck = require('./fetch').fetchDeck;
const buildAttachment = require('./buildAttachment').buildAttachment;
const _ = require('lodash');

const randomHand = async (msg, params, flags) => {
	const deck = await fetchDeck(params.join('+'));
	let text, attachment;
	if (deck) {
		//grab 6 random cards
		const randomCards = _.sortBy([...Array(6)].map(() => _.pullAt(deck.cards.sort(() => Math.random() - 0.5), _.random(deck.cards.length - 1))[0]), ['house', 'card_number']);

		//build Title
		const name = randomCards.map(card => `${card.card_number}`).join('_') + '.png';
		attachment = await buildAttachment(randomCards, name, flags, deck);
		text = '**Random hand from ' + deck.name + '**';
	} else return;

	main.sendMessage(msg, text, attachment);
};

exports.randomHand = randomHand;