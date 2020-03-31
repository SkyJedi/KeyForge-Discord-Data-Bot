const Discord = require('discord.js');
const main = require('../index');
const { fetchCard, fetchReprints, getSet, getCardLink } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');

const cards = (msg, params, flags) => {
	params = params.slice(0, 5);
	const embed = new Discord.RichEmbed();
	//fetch cards data
	const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
	if(0 >= cards.length) return;

	const name = cards.map(card => `${card.card_number}`).join('_') + '.png';
	buildAttachment(cards, name, flags).then(attachment => {
		const text = cards.map(card => {
			const reprints = fetchReprints(card, flags);
			const title = `**${card.card_title}**`;
			const value = `[${reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`).join(' • ')}](${getCardLink(card)})`;
			return title + ' • ' + value;
		}).join('\n');

		embed.setDescription(text);

		embed.setColor('3498DB').attachFile(attachment).setImage(`attachment://${name}`).setFooter(`Links by Archon Arcana • Posted by: ${msg.member
			? (msg.member.nickname ? msg.member.nickname : msg.author.username) : 'you'}`);
		main.sendMessage(msg, { embed });
	});
};

exports.cards = cards;