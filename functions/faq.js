const main = require('../index');
const Discord = require('discord.js');
const { fetchFAQ } = require('./fetch');

const faq = (msg, params) => {
	const data = fetchFAQ(params.join(' '));
	if(data) {
		const embed = new Discord.RichEmbed().setColor('ffa500').
			setTitle(`FAQ results for "${params.join(' ')}"`).
			setDescription(`**${data.question}**\n\n${format(data.answer)}`).
			setFooter('Data pulled from Official rules v1.5 Nov, 2019').
			setURL(
				'https://images-cdn.fantasyflightgames.com/filer_public/7f/d1/7fd1d910-f915-4b2c-9941-9457a8ab693a/keyforge_rulebook_v11-compressed.pdf');
		main.sendMessage(msg, { embed });
	}
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, '**$1:**');

exports.faq = faq;