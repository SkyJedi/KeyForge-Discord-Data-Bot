const Discord = require('discord.js');
const main = require('../index');
const { fetchTrait, getSet } = require('./fetch');

const trait = (msg, params, flags) => {
    params = params.slice(0, 5);
    //fetch cards data
    const cards = fetchTrait(params.join(' '), flags);
    if(0 < cards.length) {
        let text = cards.map(card => `${card.card_title} ${card.card_number} (${getSet(card.expansion)})`).join('\n');
        if(text.length > 2048) text = text.slice(0, 2030) + '\n and more.....';
        const embed = new Discord.RichEmbed()
            .setColor('cccccc')
            .setTitle(`Cards with trait: ${params.join(', ').toUpperCase()}`)
            .setDescription(text);
        main.sendMessage(msg, { embed });
    }
};

exports.trait = trait;