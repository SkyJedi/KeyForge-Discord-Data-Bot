const main = require('../index');
const {getFlagSet} = require('./fetch');
const {getFlagNumber} = require('./fetch');
const {buildAttachment} = require('./buildAttachment');
const {sets} = require('../card_data');
const {shuffle, uniqBy, get} = require('lodash');

const randomCard = async (msg, params, flags) => {
	const number = getFlagNumber(flags, 1);
	const set = getFlagSet(flags);
	let cards;

	if (set === 341) cards = require('../card_data/en/341');
	else if (set === 435) cards = require('../card_data/en/435');
	else cards = uniqBy([...require('../card_data/en/341'), ...require('../card_data/en/435')], 'card_title');

	const shuffled = shuffle(cards);
	const final = shuffled.slice(0, number);
	const name = final.map(card => `${card.card_number}`).join('_') + '.png';
	let text, attachment;
	attachment = await buildAttachment(final, name, flags);
	text = final.map(card => `**${card.card_title} • #${card.card_number} • ${get(sets.filter(set => card.expansion === set.set_number), '[0].flag', 'ERROR')}**`).join('\n');
	main.sendMessage(msg, text, attachment);
};

exports.randomCard = randomCard;