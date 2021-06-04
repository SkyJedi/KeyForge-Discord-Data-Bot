const Discord = require('discord.js');
const main = require('../index');
const { fetchText, getSet, fetchReprints } = require('./fetch');

const text = async ({ message, params, flags }) => {
    params = params.slice(0, 5);
    //fetch cards data
    const cards = fetchText(params.join(' '), flags, 'card_text');
    if (0 === cards.length) return;
    let text = '';

    for (const card of cards) {
        const reprints = fetchReprints(card);
        text += `${card.card_title}${card.rarity === 'Evil Twin' ? ' Evil Twin' : ''} • ${reprints.map(x => getSet(x.expansion))
            .join('/')} • ${card.card_type}\n`;
    }
    if (text.length > 2048) text = text.slice(0, 2030) + '\n and more.....';
    const embed = new Discord.MessageEmbed().setColor('a6a6a6')
        .setTitle(`Cards with text: ${params.join(', ').toUpperCase()}`).setDescription(text);
    await main.sendMessage({ message, embed });
};

module.exports = text;
