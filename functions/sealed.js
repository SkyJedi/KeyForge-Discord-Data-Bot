const main = require('../index');
const Discord = require('discord.js');
const {getFlagNumber, getFlagSet, fetchRandomDecks} = require('./fetch');
const {sets} = require('../card_data');
const {emoji} = require('./emoji');

const sealed = (msg, params, flags) => {
    const number = Math.min(10, getFlagNumber(flags, 2)),
        set = getFlagSet(flags),
        arr = [...Array(+number)];
    const embed = new Discord.RichEmbed().setColor('ffff00'),
        decks = arr.map(() => fetchRandomDecks(set)).filter(Boolean);
    Promise.all(decks).then(decks => {
        decks.filter(Boolean).forEach(deck => {
            embed.addField(
                `${ deck.name } • ${ sets.find(x => x.set_number === deck.expansion).flag }`,
                `${ deck._links.houses.map(house => emoji(house.toLowerCase())).join(' • ') } • ${ `[Official](https://www.keyforgegame.com/deck-details/${ deck.id }?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${ deck.id }?powered_by=archonMatrixDiscord) **•** [BT](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${ deck.id }&powered_by=archonMatrixDiscord)` }`);
        });
        main.sendMessage(msg, {embed});
    });
};

exports.sealed = sealed;