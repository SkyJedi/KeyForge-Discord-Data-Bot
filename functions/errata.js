const main = require('../index');
const errataText = require('../card_data/errata');
const Discord = require('discord.js');

const errata = (msg) => {
	const embed = new Discord.RichEmbed()
		.setColor('4c4cff')
		.setTitle('Card Errata')
		.setFooter("Data pulled from Official rules v1.4 Sept, 2019")
		.setURL("https://images-cdn.fantasyflightgames.com/filer_public/88/71/8871df4e-5647-4a22-a8cc-4e6b0a46a15c/keyforge_rulebook_v10-compressed.pdf");
	Object.keys(errataText).forEach(card => embed.addField(card, errataText[card]));
	main.sendMessage(msg, {embed});
};

exports.errata = errata;