const main = require('../index');
const errataText = require('../card_data/errata');
const { rules } = require('../card_data/');
const Discord = require('discord.js');
const {format} = require('./fetch');

const errata = (msg) => {
    const embed = new Discord.MessageEmbed()
        .setColor('4c4cff')
        .setTitle('Card Errata')
        .setFooter(`Data pulled from Official rules v${rules.version} ${rules.date}`)
        .setURL(rules.url);
	Object.keys(errataText).forEach(card => embed.addField(card, format(errataText[card])));
	main.sendMessage(msg, {embed});
};

exports.errata = errata;
