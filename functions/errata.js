const main = require('../index');
const errataText = require('../card_data/errata');
const Discord = require('discord.js');

const errata = async (msg) => {
	const embed = new Discord.RichEmbed()
		.setColor('4c4cff')
		.setTitle('Card Errata');
	Object.keys(errataText).forEach(card => embed.addField(card, errataText[card]));
	main.sendMessage(msg, {embed});
};

exports.errata = errata;