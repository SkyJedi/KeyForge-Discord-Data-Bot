const main = require('../index');
const Discord = require('discord.js');
const {fetchCard, fetchFAQ,} = require('./fetch');
const {buildAttachment} = require('./buildAttachment');
const {emoji} = require('./emoji');

const faq = async (msg, params, flags) => {
	const data = fetchCard(params.length > 1 ? params.slice(0, -1).join(' ') : params.join(' '), flags);
	const embed = new Discord.RichEmbed();
	if (data) {
		const link = `https://keyforge-compendium.com/cards/${data.card_number}?powered_by=archonMatrixDiscord`,
			searchTerm = params.length > 1 ? params.slice(-1).join() : '',
			faqs = await fetchFAQ(data.card_number, searchTerm),
			title = `${data.card_number}.png`,
			attachment = await buildAttachment([data], title, flags),
			house = emoji(data.house.toLowerCase()),
			rarity = emoji(data.rarity.toLowerCase());
		embed.setColor('ffa500')
			.setTitle(`${data.card_title} #${data.card_number}`)
			.attachFile(attachment)
			.setThumbnail(`attachment://${title}`)
			.addField(`${house} • ${rarity} • ${data.card_type}`, data.card_text);
		faqs.forEach(faq => {
			embed.addField(faq.question.length < 250 ? faq.question : `${faq.question.slice(0, 250)}...`, faq.answer.length < 925 ? faq.answer : `${faq.answer.slice(0, 925)}...[(con't)](${link})`);
		});
		if (faqs.length <= 0) embed.addField(`There are no FAQs currently for ${data.card_title} with the search term "${searchTerm}"`, `[Ask the Developers](https://www.fantasyflightgames.com/en/contact/rules/?powered_by=archonMatrixDiscord)`);
		embed.addField('Data Provided by', `[KeyForge Compendium](https://keyforge-compendium.com/?powered_by=archonMatrixDiscord)`);
	} else embed.setColor('FF0000').setDescription(`Card: ${params.join(' ')}: not found!`);

	main.sendMessage(msg, {embed});
};

exports.faq = faq;