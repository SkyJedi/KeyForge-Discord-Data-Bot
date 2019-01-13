const main = require('../index');
const Discord = require('discord.js');
const fetchCard = require('./fetch').fetchCard;
const asyncForEach = require('./basic').asyncForEach;
const buildAttachment = require('./buildAttachment').buildAttachment;

const brackets = async (msg, params, client, lang) => {
	params = params.slice(0, 5);
	//fetch cards data
	let data = [], error = ``;
	await asyncForEach(params, async card => data.push(fetchCard(card, lang)));
	data.forEach((val, index) => !val && (error += `\n${params[index]} not found!`));
	data = data.filter(Boolean);
	const embed = new Discord.RichEmbed();
	if (0 < data.length) {
		const name = data.map(card => `${card.card_number}`).join('_') + '.png';
		const attachment = await buildAttachment(data, name, lang);
		embed.setColor('4B0082')
			.setDescription(`${data.map(card => `**[${card.card_title} #${card.card_number}](https://keyforge-compendium.com/cards/${card.card_number}?powered_by=archonMatrixDiscord)**`).join(', ')} ${error}`)
			.attachFile(attachment)
			.setImage(`attachment://${name}`)
			.setFooter(`Links provided by KeyForge Compendium`);
	} else embed.setColor('FF0000').setDescription(error);

	main.sendMessage(msg, {embed});
};

exports.brackets = brackets;