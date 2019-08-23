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
			.setDescription(format(rules[key]))
			.setFooter("Data pulled from Official rules v1.3 May, 2019")
			.setURL("https://images-cdn.fantasyflightgames.com/filer_public/f9/a2/f9a28865-cd96-4f36-97e5-0f8ea75288c0/keyforge_rulebook_v9-compressed.pdf");
		main.sendMessage(msg, {embed});
	}
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, "**$1:**");

exports.rule = rule;