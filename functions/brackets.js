const main = require('../index');
const Discord = require('discord.js');
const fetchCard = require('./fetch').fetchCard;
const buildAttachment = require('./buildAttachment').buildAttachment;

const brackets = async (msg, params, flags) => {
	params = params.slice(0, 5);
	//fetch cards data
	const cards = params.map(card => fetchCard(card, flags));
	const error = cards.map((val, index) => !val && `\n${params[index]} not found!`).filter(Boolean).join(' ');
	const final = cards.filter(Boolean);
	const embed = new Discord.RichEmbed();
	if (0 < final.length) {
		const name = final.map(card => `${card.card_number}`).join('_') + '.png';
		const attachment = await buildAttachment(final, name, flags);
		embed.setColor('4B0082')
			.setDescription(`${final.map(card => `**[${card.card_title} #${card.card_number}](https://keyforge-compendium.com/cards/${card.card_number}?powered_by=archonMatrixDiscord)**`).join(', ')}\n${error}`)
			.attachFile(attachment)
			.setImage(`attachment://${name}`)
			.setFooter(`Links provided by KeyForge Compendium`);
	} else embed.setColor('FF0000').setDescription(error);

	main.sendMessage(msg, {embed});
};

exports.brackets = brackets;