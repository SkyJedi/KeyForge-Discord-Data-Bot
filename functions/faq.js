const main = require('../index');
const Discord = require('discord.js');
const { imageCDN } = require('../config');
const { fetchFAQ, fetchCard, getCardLink } = require('./fetch');

const faq = async ({ message, params }) => {
    const card = fetchCard(params.join(' '));
    if (!card) return;
    const data = await fetchFAQ(card);
    if (!data) return;
    if (data) {
        let text = '';
        for (const x of data) {
            const [question, answer] =
                x.title.RulesText.split('//');
            if (text.length + (question ? question.length : 0) + (answer ? answer.length : 0) > 1950) {
                text += `[and more....](${getCardLink(card)})`;
                break;
            }
            text += `**${format(question)}**\n\n`;
            text += answer ? format(answer) + '\n\n' : '';
        }
        const embed = new Discord.MessageEmbed().setColor('ffa500')
            .setTitle(`FAQ results for "${card.card_title}"`)
            .setThumbnail(`${imageCDN}en/${card.expansion}/${card.card_number}.png`)
            .setFooter(`Data pulled from Archon Arcana`)
            .setURL(getCardLink(card))
            .setDescription(text);
        main.sendMessage(message, { embed });
    }
};

const format = (text) => text.replace(/\/small+/g, '')
    .replace(/\/i+/g, '')
    .replace(/[\[\]']+/g, '')
    .replace(/&([a-z\d_-]+);/gi, '');

module.exports = faq;
