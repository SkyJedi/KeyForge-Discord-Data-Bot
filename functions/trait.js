const Discord = require('discord.js');
const main = require('../index');
const { fetchText, getSet, fetchReprints } = require('./fetch');

const trait = ({ message, params, flags }) => {
    params = params.slice(0, 5);
    //fetch cards data
    const cards = fetchText(params.join(' '), flags, 'traits');
    if (0 === cards.length) return;
    let text = '';

    for (const card of cards) {
        const reprints = fetchReprints(card);
        text += `${card.card_title}${card.rarity === 'Evil Twin' ? ' Evil Twin': ''} • ${reprints.map(x => getSet(x.expansion)).join('/')} • ${card.traits}\n`;
    }
    if (text.length > 2048) text = text.slice(0, 2030) + '\n and more.....';
    const embed = new Discord.MessageEmbed().setColor('cccccc')
        .setTitle(`Cards with trait: ${params.join(', ').toUpperCase()}`).setDescription(text);
    main.sendMessage(message, { embed });
};

module.exports = trait;
