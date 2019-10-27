const main = require('../index');
const Discord = require('discord.js');
const {buildDeckList} = require('./buildDeckList');
const {fetchDeck, fetchDeckBasic, fetchDoK, getFlagLang} = require('./fetch');
const {emoji} = require('./emoji');
const {sets} = require('../card_data');
const {get, snakeCase} = require('lodash');

const deck = async (msg, params, flags) => {
    const lang = getFlagLang(flags);
    let deck;
    if(0 >= params.length) return;
    if(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(params[0])) deck = await fetchDeckBasic(params[0], lang);
    else deck = await fetchDeck(params.join('+'), lang);

    const embed = new Discord.RichEmbed();
    if(deck) {
        const dokStats = fetchDoK(deck.id);
        const attachment = buildDeckList(deck, lang);
        Promise.all([dokStats, attachment]).then(([dokStats, attachment]) => {
            const houses = deck._links.houses.map(house => emoji(house.toLowerCase())).join(' • '),
                power = ` • ${ deck.power_level } ${ emoji('power') } • ${ deck.chains } ${ emoji('chains') } • ${ deck.wins }W/${ deck.losses }L`,
                cardStats = getCardStats(deck.cards, deck.expansion),
                cardTypes = Object.keys(cardStats.card_type).map(type => `${ cardStats.card_type[type] } ${ type }s`).join(' • '),
                amber = `${ cardStats.amber }${ emoji('aember') }`,
                mavericks = cardStats.is_maverick > 0 ? `${ cardStats.is_maverick }${ emoji('maverick') }` : false,
                anomaly = cardStats.is_anomaly > 0 ? `${ cardStats.is_anomaly }${ emoji('anomaly') }` : false,
                legacy = cardStats.legacy > 0 ? `${ cardStats.legacy }${ emoji('legacy') }` : false,
                rarity = ['Special', 'Rare', 'Uncommon', 'Common'].map(type => {
                    if(cardStats.rarity[type]) return `${ cardStats.rarity[type] }${ emoji(type.toLowerCase()) }`;
                }).filter(Boolean).join(' • '),
                links = `[Official](https://www.keyforgegame.com/deck-details/${ deck.id }?powered_by=archonMatrixDiscord) • [Decks of KeyForge](https://decksofkeyforge.com/decks/${ deck.id }?powered_by=archonMatrixDiscord) • [Burger Tokens](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${ deck.id }&powered_by=archonMatrixDiscord)`,
                set = get(sets.filter(set => deck.expansion === set.set_number), '[0].flag', 'ERROR'),
                name = `${ snakeCase(deck.name) }.jpg`,
                file = new Discord.Attachment(attachment.toBuffer('image/jpeg', {quality: 0.75}), name);

            embed.setColor('178110')
                .setTitle(` ${ deck.name } • ${ set }`)
                .addField(houses + power, cardTypes)
                .addField(amber + ' • ' + rarity + ([mavericks, legacy, anomaly].some(type => type.length > 0) ? ' • ' : '') + [mavericks, legacy, anomaly].filter(type => type).join(' • '), dokStats.sas + ' • ' + dokStats.sasStar)
                .addField(dokStats.deckAERC, links)
                .attachFile(file)
                .setImage(`attachment://${ name }`)
                .setFooter(`Posted by: @${ msg.member.nickname ? msg.member.nickname : msg.author.username }`);
            main.sendMessage(msg, {embed}, null, flags);
        }).catch(console.error);
    } else main.sendMessage(msg, embed.setColor('FF0000').setDescription(`Deck - ${ params.join(' ') }: not found!`));
};

const getCardStats = (cards, expansion) => {
    return {
        amber: cards.reduce((acc, card) => acc + card.amber, 0),
        card_type: cards.reduce((acc, card) => ({...acc, [card.card_type]: acc[card.card_type] + 1}),
            {Action: 0, Artifact: 0, Creature: 0, Upgrade: 0}
        ),
        rarity: cards.reduce((acc, card) =>
            ({
                ...acc,
                [rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1 : 1
            }), {}),
        is_maverick: cards.filter(card => card.is_maverick).length,
        is_anomaly: cards.filter(card => card.is_anomaly).length,
        legacy: cards.filter(card => +card.expansion < +expansion).length
    };
};

const rarityFix = rarity => rarity === 'FIXED' || rarity === 'Variant' ? 'Special' : rarity;

exports.deck = deck;