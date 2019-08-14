const main = require('../index');
const Discord = require('discord.js');
const rules = require('../card_data/rules');
const {findIndex, upperCase} = require('lodash');

const rule = (msg, params) => {
	let i = findIndex(Object.keys(rules), term => term === params.join(' '));
	if (!i) i = findIndex(Object.keys(rules), term => term.startsWith(params.join(' ')));
	const key = Object.keys(rules)[i];
	let embed = new Discord.RichEmbed();

	if (key) {
		embed.setColor('1DE5C7')
			.setTitle(`RULE - ${upperCase(key)}`)
			.setDescription(format(rules[key]));
	} else embed.setColor('FF0000').setDescription(`Rule: ${params.join(' ')} not found`);

	main.sendMessage(msg, {embed});
};

const format = (text) => {
	return text.replace(/([a-z\d_-]+):/gi, "**$1:**");
};

exports.rule = rule;