const main = require('../index');
const { fetchCard, fetchReprints, getSet } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');

const cards = (msg, params, flags) => {
	params = params.slice(0, 5);
	let text;
	//fetch cards data
	const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
	if(0 >= cards.length) return;

	const name = cards.map(card => `${card.card_number}`).join('_') + '.png';
	buildAttachment(cards, name, flags).then(attachment => {
		text = cards.map(card => {
			const reprints = fetchReprints(card, flags);
			return `**${card.card_title} • ${reprints.map(x => `${getSet(x.expansion)}(${x.card_number})`).join(' • ')}**`;
		}).join('\n');
		main.sendMessage(msg, text, attachment);
	});
};

exports.cards = cards;