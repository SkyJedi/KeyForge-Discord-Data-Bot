const main = require('../index');
const Discord = require('discord.js');
const {fetchFAQ} = require('./fetch');

const faq = async (msg, params, flags) => {
	const data = fetchFAQ(params, flags);
	if (data) {
		const embed = new Discord.RichEmbed()
			.setColor('ffa500')
			.setTitle(data.question)
			.setDescription(format(data.answer))
			.setFooter("Data pulled from Official rules v1.4 Sept, 2019")
			.setURL("https://images-cdn.fantasyflightgames.com/filer_public/88/71/8871df4e-5647-4a22-a8cc-4e6b0a46a15c/keyforge_rulebook_v10-compressed.pdf");
		main.sendMessage(msg, {embed});
	}
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, "**$1:**");


exports.faq = faq;