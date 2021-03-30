const main = require('../index');
const Discord = require('discord.js');
const {getFlagNumber, getFlagSet, getFlagHouse, fetchRandomDecks} = require('./fetch');
const multiDeck = require('./multiDeck');
const {sets} = require('../card_data');
const {emoji} = require('./emoji');
const {sample} = require('lodash');

const sealed = ({msg, flags}) => {
    const number = Math.min(10, getFlagNumber(flags, 2));
    const houses = getFlagHouse(flags);
    const set = getFlagSet(flags);
    let arr = [];
    for (let i = 0; i < number; i++) {
        if (flags.includes('rainbow')) {
            let setsWithHouses = sets.filter(x => x.set_number !== 453);
            if (houses) {
                setsWithHouses.filter(x => x.houses.some(y => houses.includes(y)))
            }
            arr.push(setsWithHouses.length > 0 && sample(setsWithHouses).set_number);
        } else {
            arr.push(set);
        }
    }

    const embed = new Discord.MessageEmbed().setColor('ffff00').setTitle(`Sealed Deck${arr.length > 1 ? 's' : ''}`);
    const decks = arr.map(expansion => fetchRandomDecks({expansion, houses})).filter(Boolean);
    Promise.all(decks).then(decks => {
        decks.filter(Boolean).forEach(deck => {
            embed.addField(
                `${deck.name} • ${sets.find(x => x.set_number === deck.expansion).flag}`,
                `${deck._links.houses.map(house => emoji(house.toLowerCase()))
                    .join(
                        ' • ')} • [Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`);
        });
        main.sendMessage(msg, {embed});
        if (['decks', 'deck', 'decklists', 'dl', 'decklist'].some(x => flags.includes(x))) multiDeck(msg, decks.map(x => x.id), flags);
    });
};

module.exports = sealed;
