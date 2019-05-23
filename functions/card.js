const main = require('../index');
const Discord = require('discord.js');
const fetchCard = require('./fetch').fetchCard;
const buildAttachment = require('./buildAttachment').buildAttachment;
const sets = {341: 'CotA', 435: 'AoA'};


const card = async (msg, params, client, lang, set) => {
	const data = fetchCard(params.join(' '), lang, set);
	const embed = new Discord.RichEmbed();
	if (data) {
		const title = `${data.card_number}.png`;
		const attachment = await buildAttachment([data], title, lang);
		embed.setColor('031763')
			.setDescription(`**[${data.card_title} #${data.card_number} ${sets[data.expansion]}](https://keyforge-compendium.com/cards/${data.card_number}?powered_by=archonMatrixDiscord)** `)
			.attachFile(attachment)
			.setImage(`attachment://${title}`)
			.setFooter(`Link provided by KeyForge Compendium`);
	} else embed.setColor('FF0000').setDescription(`Card: ${params.join(' ')}: not found!`);

	main.sendMessage(msg, {embed});
};

exports.card = card;