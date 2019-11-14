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
			.setFooter("Data pulled from Official rules v1.5 Nov, 2019")
			.setURL("https://images-cdn.fantasyflightgames.com/filer_public/7f/d1/7fd1d910-f915-4b2c-9941-9457a8ab693a/keyforge_rulebook_v11-compressed.pdf");
		main.sendMessage(msg, {embed});
	}
};

exports.rule = rule;