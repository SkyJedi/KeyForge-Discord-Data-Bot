const main = require('../index');
const Discord = require('discord.js');
const { getFlagSet } = require('./fetch');
const { getFlagNumber, fetchReprints, getCardLink, getSet, getFlagLang } = require('./fetch');
const { buildAttachment } = require('./buildAttachment');
const AllCards = require('../card_data');
const { shuffle, uniqBy } = require('lodash');

const randomCard = async (msg, params, flags) => {
    const number = Math.min(5, getFlagNumber(flags, 1));
    const language = getFlagLang(flags);
    const set = getFlagSet(flags);
    const embed = new Discord.MessageEmbed();
    let cards = uniqBy(AllCards[language], 'card_title');

    if(set) {
        cards = cards.filter(x => x.expansion === set);
    }

    cards = shuffle(cards).slice(0, number);
    if(0 >= cards.length) return;

    const name = cards.map(card => `${card.card_number}`).join('_') + '.jpg';
    buildAttachment(cards, name, flags).then(attachment => {
        const text = cards.map(card => {
            const reprints = fetchReprints(card, flags);
            const title = `**${card.card_title}**`;
            const value = `[${reprints.map(x => `${getSet(x.expansion)} (${x.card_number})`)
                .join(' • ')}](${getCardLink(card)})`;
            return title + ' • ' + value;
        }).join('\n');

        embed.setDescription(text);

        embed.setColor('3498DB')
            .attachFiles(attachment)
            .setImage(`attachment://${name}`)
            .setFooter(`Links by Archon Arcana • Posted by: ${msg.member
                                                              ? (msg.member.nickname ? msg.member.nickname : msg.author.username) : 'you'}`);
        main.sendMessage(msg, { embed });
    });
};

module.exports = randomCard;
