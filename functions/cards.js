const Discord = require('discord.js');
const main = require('../index');
const { emoji } = require('./emoji');
const { fetchCard, fetchErrata, fetchReprints, getSet, getCardLink, getCardLinkDoK } = require('./fetch');
const buildAttachment  = require('./buildAttachment');

const cards = async ({message, params, flags}) => {
    params = params.slice(0, 7);
    const embed = new Discord.MessageEmbed();
    //fetch cards data
    const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
    if (0 >= cards.length) return;

    const name = cards.map(card => `${card.card_number}`).join('_') + '.jpg';
    const attachment = await buildAttachment(cards, name, flags);
    const text = cards.map(card => {
        const reprints = fetchReprints(card, flags);
        const errata = fetchErrata(card);
        const title = `**${card.card_title}** • ${emoji(card.card_type.toLowerCase())} • ${emoji((card.rarity === 'FIXED' || card.rarity ===
        'Variant' ? 'Special' : card.rarity).toLowerCase())}`;
        const value = `${reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`)
                                 .join(' • ')}`;
        return title + '\n\t' + value + ` • [AA](${getCardLink(card)}) • [DoK](${getCardLinkDoK(card)})${errata ? '\n\t **Errata:** ' + errata.card_text : ''}`;
    }).join('\n');
    embed.setDescription(text)
         .setColor('3498DB')
         .attachFiles(attachment)
         .setImage(`attachment://${name}`)
         .setFooter(`Posted by: ${message.member ? (message.member.nickname ? message.member.nickname : message.author.username) : 'you'}`);
    if (['i', 'image'].some(x=> flags.includes(x))){
        main.sendMessage(message, '', attachment);
    } else {
        main.sendMessage(message, { embed });
    }
};

module.exports = cards;
