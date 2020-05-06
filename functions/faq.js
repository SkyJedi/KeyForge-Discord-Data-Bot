const main = require('../index');
const Discord = require('discord.js');
const { fetchFAQ } = require('./fetch');
const { rules } = require('../card_data');

const faq = (msg, params) => {
	const data = fetchFAQ(params.join(' '));
	if(data) {
        const embed = new Discord.MessageEmbed().setColor('ffa500')
            .setTitle(`FAQ results for "${params.join(' ')}"`)
            .setDescription(`**${data.question}**\n\n${format(data.answer)}`)
            .setFooter(`Data pulled from Official rules v${rules.version} ${rules.date}`)
            .setURL(rules.url);
        main.sendMessage(msg, { embed });
    }
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, '**$1:**');

exports.faq = faq;
