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
			.setFooter("Data pulled from Official rules v1.3 May, 2019")
			.setURL("https://images-cdn.fantasyflightgames.com/filer_public/f9/a2/f9a28865-cd96-4f36-97e5-0f8ea75288c0/keyforge_rulebook_v9-compressed.pdf");

		main.sendMessage(msg, {embed});
	}
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, "**$1:**");


exports.faq = faq;