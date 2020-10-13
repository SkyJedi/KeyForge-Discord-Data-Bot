const Discord = require('discord.js');
const main = require('../index');
const { fetchCard, fetchReprints, getSet, getCardLink, getCardLinkDoK } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');

const cards = async (msg, params, flags) => {
    params = params.slice(0, 7);
    const embed = new Discord.MessageEmbed();
    //fetch cards data
    const cards = params.map(card => fetchCard(card, flags)).filter(Boolean);
    if (0 >= cards.length) return;

    const name = cards.map(card => `${card.card_number}`).join('_') + '.jpg';
    const attachment = await buildAttachment(cards, name, flags);
    const text = cards.map(card => {
        const reprints = fetchReprints(card, flags);
        const title = `**${card.card_title}**`;
        const value = `${reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`)
                                 .join(' • ')}`;
        return title + ' • ' + value + ` • [AA](${getCardLink(card)}) • [DoK](${getCardLinkDoK(card)})`;
    }).join('\n');
    embed.setDescription(text)
         .setColor('3498DB')
         .attachFiles(attachment)
         .setImage(`attachment://${name}`)
         .setFooter(`Posted by: ${msg.member ? (msg.member.nickname ? msg.member.nickname : msg.author.username) : 'you'}`);
    if (['i', 'image'].some(x=> flags.includes(x))){
        main.sendMessage(msg, '', attachment);
    } else {
        main.sendMessage(msg, { embed });
    }
};

module.exports = cards;
