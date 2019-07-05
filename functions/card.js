const main = require('../index');
const Discord = require('discord.js');
const _ = require('lodash');
const fetchCard = require('./fetch').fetchCard;
const buildAttachment = require('./buildAttachment').buildAttachment;
const sets = require('../card_data').sets;

const card = async (msg, params, flags) => {
	const data = fetchCard(params.join(' '), flags);
	const embed = new Discord.RichEmbed();
	if (data) {
		const title = `${data.card_number}.png`;
		const attachment = await buildAttachment([data], title, flags);
		const set = _.get(sets.filter(set => data.expansion === set.set_number), '[0].flag', 'ERROR');
		embed.setColor('031763')
			.setDescription(`**[${data.card_title} #${data.card_number} ${set}](https://keyforge-compendium.com/sets/${data.expansion === 341 ? 1 : 2}/cards/${data.card_number}?powered_by=archonMatrixDiscord)** `)
			.attachFile(attachment)
			.setImage(`attachment://${title}`)
			.setFooter(`Link provided by KeyForge Compendium`);
	} else embed.setColor('FF0000').setDescription(`Card: ${params.join(' ')}: not found!`);

	main.sendMessage(msg, {embed});
};

exports.card = card;