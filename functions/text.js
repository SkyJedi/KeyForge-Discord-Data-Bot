const Discord = require('discord.js');
const main = require('../index');
const { fetchText, getSet } = require('./fetch');
const { uniqBy, sortBy } = require('lodash');

const text = ({ msg, params, flags }) => {
    params = params.slice(0, 5);
    //fetch cards data
    const cards = fetchText(params.join(' '), flags, 'card_text');
    if (0 < cards.length) {
        let filtered = uniqBy(cards, 'card_title')
            .filter(x => x.rarity !== 'Evil Twin')
            .concat(cards.filter(x => x.rarity === 'Evil Twin'));
        filtered = sortBy(filtered, ['card_title'])
        let text = filtered.map(
            card => `${card.card_title}${card.rarity === 'Evil Twin' ? ' Evil Twin' : ''} • ${cards.filter(x => x.card_title === card.card_title && x.rarity === card.rarity)
                .map(x => getSet(x.expansion)).join('/')} • ${card.card_type}`).join('\n');
        if (text.length > 2048) text = text.slice(0, 2030) + '\n and more.....';
        const embed = new Discord.MessageEmbed().setColor('a6a6a6')
            .setTitle(`Cards with text: ${params.join(', ').toUpperCase()}`).setDescription(text);
        main.sendMessage(msg, { embed });
    }
};

module.exports = text;
