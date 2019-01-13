const main = require('../index');
const Discord = require('discord.js');
const fetchCard = require('./fetch').fetchCard;
const fetchFAQ = require('./fetch').fetchFAQ;
const path = require('../config').path;
const emoji = require('./emoji').emoji;

const faq = async (msg, params, client, lang) => {
	const data = fetchCard(params.length > 1 ? params.slice(0, -1).join(' ') : params.join(' '), lang);
	const embed = new Discord.RichEmbed();
	if (data) {
		let link = `https://keyforge-compendium.com/cards/${data.card_number}?powered_by=archonMatrixDiscord`;
		const searchTerm = params.length > 1 ? params.slice(-1).join() : '';
		const faqs = await fetchFAQ(data.card_number, searchTerm);
		const house = await emoji(data.house.toLowerCase(), client);
		const rarity = await emoji(data.rarity.toLowerCase(), client);
		const title = `${data.card_number}.png`;
		const attachment = new Discord.Attachment(`${path}card_images/${lang}/${data.card_number}.png`, title);
		embed.setColor('ffa500')
			.setTitle(`${data.card_title} #${data.card_number}`)
			.attachFile(attachment)
			.setThumbnail(`attachment://${title}`)
			.addField(`${house} • ${rarity} • ${data.card_type}`, data.card_text);
		faqs.forEach(faq => {
			embed.addField(faq.question, faq.answer.length < 925 ? faq.answer : `${faq.answer.slice(0, 925)}...[(con't)](${link})`)
		});
		if (faqs.length <= 0) embed.addField(`There are no FAQs currently for ${data.card_title} with the search term "${searchTerm}"`, `[Ask the Developers](https://www.fantasyflightgames.com/en/contact/rules/?powered_by=archonMatrixDiscord)`);
		embed.addField('Data Provided by', `[KeyForge Compendium](https://keyforge-compendium.com/?powered_by=archonMatrixDiscord)`);
	} else embed.setColor('FF0000').setDescription(`Card: ${params.join(' ')}: not found!`);

	main.sendMessage(msg, {embed});
};

exports.faq = faq;