const main = require('../index');
const {fetchDeck, getFlagNumber} = require('./fetch');
const {buildAttachment} = require('./buildAttachment');
const {shuffle, sortBy} = require('lodash');

const randomHand = async (msg, params, flags) => {
	const deck = await fetchDeck(params.join('+'));
	const number = getFlagNumber(flags, 6);
	let text, attachment;
	if (deck) {
		//grab 6 random cards
		const randomCards = sortBy(shuffle(deck.cards).slice(0, Math.min(number ? number : 6, 8)), ['house', 'card_number']);

		//build Title
		const name = randomCards.map(card => `${card.card_number}`).join('_') + '.png';
		attachment = await buildAttachment(randomCards, name, flags, deck);
		text = '**Random hand from ' + deck.name + '**';
	} else return;

	main.sendMessage(msg, text, attachment);
};

exports.randomHand = randomHand;