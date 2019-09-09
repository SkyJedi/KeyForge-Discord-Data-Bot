const main = require('../index');
const Discord = require('discord.js');
const rules = require('../card_data/rules');
const {findIndex, upperCase} = require('lodash');
const {format} = require('./fetch');

const rule = (msg, params) => {
	let i = findIndex(Object.keys(rules), term => term === params.join(' '));
	if (0 > i) i = findIndex(Object.keys(rules), term => term.startsWith(params.join(' ')));
	if (0 > i) i = findIndex(Object.keys(rules), term => term.includes(params.join(' ')));
	const key = Object.keys(rules)[i];
	let embed = new Discord.RichEmbed();

	if (key) {
		embed.setColor('1DE5C7')
			.setTitle(`RULE - ${upperCase(key)}`)
			.setDescription(format(rules[key]))
			.setFooter("Data pulled from Official rules v1.4 Sept, 2019")
			.setURL("https://images-cdn.fantasyflightgames.com/filer_public/88/71/8871df4e-5647-4a22-a8cc-4e6b0a46a15c/keyforge_rulebook_v10-compressed.pdf");
		main.sendMessage(msg, {embed});
	}
};

exports.rule = rule;