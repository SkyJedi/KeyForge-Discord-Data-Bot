const main = require('../index');
const fetchCard = require('./fetch').fetchCard;
const buildAttachment = require('./buildAttachment').buildAttachment;
const sets = require('../card_data').sets;
const _ = require('lodash');

const cards = async (msg, params, flags) => {
	params = params.slice(0, 5);
	let text, attachment;
	//fetch cards data
	const cards = params.map(card => fetchCard(card, flags));
	const final = cards.filter(Boolean);
	if (0 < final.length) {
		const name = final.map(card => `${card.card_number}`).join('_') + '.png';
		attachment = await buildAttachment(final, name, flags);
		text = final.map(card => `**${card.card_title} • #${card.card_number} • ${_.get(sets.filter(set => card.expansion === set.set_number), '[0].flag', 'ERROR')}**`).join('\n');
	} else return;

	main.sendMessage(msg, text, attachment);
};

exports.cards = cards;