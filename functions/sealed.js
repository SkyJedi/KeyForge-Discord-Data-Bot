const main = require('../index');
const Discord = require('discord.js');
const { getFlagNumber, getFlagSet, getFlagHouse, fetchRandomDecks } = require('./fetch');
const { multiDeck } = require('./multiDeck');
const { sets } = require('../card_data');
const { emoji } = require('./emoji');
const { shuffle } = require('lodash');

const sealed = (msg, params, flags) => {
    const number = Math.min(10, getFlagNumber(flags, 2));
    const house = getFlagHouse(flags);
    const set = getFlagSet(flags);
    let arr = [...Array(+number)];

    if(flags.includes('rainbow')) {
        arr = arr.map(() => {
            let setsWithHouses = sets.map(x=> {
                if (x.set_number === 453) return;
                if(house && !x.houses.includes(house)) return;
                return x.set_number;
            }).filter(Boolean);
            return shuffle(setsWithHouses)[0];
        });
    } else arr = arr.fill(set);

    const embed = new Discord.MessageEmbed().setColor('ffff00').setTitle(`Sealed Deck${arr.length > 1 ? 's' : ''}`);
    const decks = arr.map(expansion => fetchRandomDecks({ expansion, house })).filter(Boolean);
    Promise.all(decks).then(decks => {
        decks.filter(Boolean).forEach(deck => {
            embed.addField(
                `${deck.name} • ${sets.find(x => x.set_number === deck.expansion).flag}`,
                `${deck._links.houses.map(house => emoji(house.toLowerCase()))
                    .join(
                        ' • ')} • [Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`);
        });
        main.sendMessage(msg, { embed });
        if(['decks', 'deck', 'decklists', 'dl', 'decklist'].some(x => flags.includes(x))) multiDeck(msg, decks.map(x => x.id), flags);
    });
};

exports.sealed = sealed;
