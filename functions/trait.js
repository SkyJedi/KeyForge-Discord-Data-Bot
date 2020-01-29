const Discord = require('discord.js');
const main = require('../index');
const { fetchText, getSet } = require('./fetch');
const { uniqBy } = require('lodash');

const trait = (msg, params, flags) => {
	params = params.slice(0, 5);
	//fetch cards data
	const cards = fetchText(params.join(' '), flags, 'traits');
	if(0 < cards.length) {
		let filtered = uniqBy(cards, 'card_title');
		let text = filtered.map(card => `${card.card_title} • ${cards.filter(x => x.card_title === card.card_title).
			map(x => getSet(x.expansion)).
			join('/')} • ${card.traits}`).join('\n');
		if(text.length > 2048) text = text.slice(0, 2030) + '\n and more.....';
		const embed = new Discord.RichEmbed().setColor('cccccc').
			setTitle(`Cards with trait: ${params.join(', ').toUpperCase()}`).
			setDescription(text);
		main.sendMessage(msg, { embed });
	}
};

exports.trait = trait;