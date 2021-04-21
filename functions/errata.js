const main = require('../index');
const erratas = require('../card_data/erratas');
const { rules } = require('../card_data/');
const Discord = require('discord.js');

const errata = ({message}) => {
    const embed = new Discord.MessageEmbed()
        .setColor('4c4cff')
        .setTitle('Card Errata')
        .setFooter(`Data pulled from Official rules v${rules.version} ${rules.date}`)
        .setURL(rules.url);
	erratas.forEach(card => embed.addField(card.card_title, card.card_text));
	main.sendMessage(message, {embed});
};

module.exports = errata;
