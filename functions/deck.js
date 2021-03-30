const main = require('../index');
const Discord = require('discord.js');
const buildDeckList  = require('./buildDeckList');
const { fetchDeck, fetchDoK, buildEnhancements, getFlagLang } = require('./fetch');
const { emoji } = require('./emoji');
const { sets } = require('../card_data');
const { get } = require('lodash');

const deck = async ({msg, params, flags}) => {
    if (0 >= params.length) return;
    let deck;
    try {
        deck = await fetchDeck(params);
    } catch(err){
        return;
    }
    deck = deck[0];
    deck.enhancements = await buildEnhancements(deck);
    buildDeck(msg, deck, flags);
};

const buildDeck = (msg, deck, flags) => {
    const lang = getFlagLang(flags);
    const embed = new Discord.MessageEmbed();
    const dokStats = fetchDoK(deck.id);
    const attachment = buildDeckList(deck, lang);

    Promise.all([dokStats, attachment]).then(([dokStats, attachment]) => {
        const cardStats = getCardStats(deck.cards);
        const mavericks = cardStats.is_maverick > 0 ? `${cardStats.is_maverick}${emoji('maverick')}` : false;
        const anomaly = cardStats.is_anomaly > 0 ? `${cardStats.is_anomaly}${emoji('anomaly')}` : false;
        const legacy = deck.set_era_cards.Legacy.length >
                       0 ? `${deck.set_era_cards.Legacy.length}${emoji('legacy')}` : false;
        const set = get(sets.filter(set => deck.expansion === set.set_number), '[0].flag', 'ERROR');
        const name = `${deck.id}.jpg`;
        const enhancements = deck.enhancements ? 'Enhancements: ' + Object.keys(deck.enhancements)
                                                                          .map(x => `${deck.enhancements[x]}${emoji(x)}`)
                                                                          .join(' • ') + '\n' : '';
        let description = deck._links.houses.map(house => emoji(house.toLowerCase())).join(' • ');
        description += deck.wins === 0 && deck.losses ===
                       0 ? '\n' : ` • ${deck.power_level}${emoji('power')} •${deck.chains}${emoji(
            'chains')} • ${deck.wins}W/${deck.losses}L\n`;
        description += Object.keys(cardStats.card_type)
                             .map(type => cardStats.card_type[type] ? `${cardStats.card_type[type]}${emoji(type.toLowerCase())}` : false).filter(Boolean)
                             .join(' • ') + '\n';
        description += `${cardStats.amber}${emoji('aember')} • `;
        description += ['Special', 'Rare', 'Uncommon', 'Common'].map(
            type => cardStats.rarity[type] ? `${cardStats.rarity[type]}${emoji(type.toLowerCase())}` : false)
                                                                .filter(Boolean)
                                                                .join(' • ');
        description += ([mavericks, legacy, anomaly].some(type => type) ? ' • ' : '') +
            [mavericks, legacy, anomaly].filter(type => type).join(' • ') + '\n';
        description += enhancements;
        description += `${dokStats.sas} • ${dokStats.sasStar}\n`;
        description += `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) • [AA](https://archonarcana.com/Deck:${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`;
        const stream = attachment.createJPEGStream();
        stream.on('end', () => attachment.dispose());
        const file = new Discord.MessageAttachment(stream, name);

        embed.setColor('178110')
             .setTitle(` ${deck.name} • ${set}`)
             .setDescription(description)
             .attachFiles(file)
             .setImage(`attachment://${name}`)
             .setFooter(`Posted by: ${msg.member ? (msg.member.nickname ? msg.member.nickname : msg.author.username) : 'you'}`);
        main.sendMessage(msg, { embed }, null, flags);
    }).catch(console.error);
};

const getCardStats = (cards) => {
    return {
        amber: cards.reduce((acc, card) => acc + card.amber, 0),
        card_type: cards.reduce((acc, card) => ({
                ...acc, [card.card_type.replace(/\d+/g, '')]: acc[card.card_type.replace(/\d+/g, '')] + 1
            }),
            { Action: 0, Artifact: 0, Creature: 0, Upgrade: 0, Evil_Twin: 0 }
        ),
        rarity: cards.reduce((acc, card) =>
            ({
                ...acc,
                [rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1 : 1
            }), {}),
        is_maverick: cards.filter(card => card.is_maverick).length,
        is_anomaly: cards.filter(card => card.is_anomaly).length
    };
};

const rarityFix = rarity => rarity === 'FIXED' || rarity === 'Variant' ? 'Special' : rarity;

module.exports = { deck, buildDeck };
