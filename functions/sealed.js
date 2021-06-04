const main = require('../index');
const Discord = require('discord.js');
const { getFlagNumber, getFlagSet, getFlagHouses, fetchRandomDecks } = require('./fetch');
const multiDeck = require('./multiDeck');
const { sets } = require('../card_data');
const { emoji } = require('./emoji');
const { sample } = require('lodash');

const sealed = async ({ message, flags }) => {
    const number = Math.min(10, getFlagNumber(flags, 2));
    const houses = getFlagHouses(flags);
    const expansion = getFlagSet(flags);
    const embed = new Discord.MessageEmbed().setColor('ffff00').setTitle(`Sealed Deck${number > 1 ? 's' : ''}`);

    for (let i = 0; i < number; i++) {
        let deck;
        if (flags.includes('rainbow')) {
            let setsWithHouses = sets.filter(x => x.set_number !== 453 && x.set_number < 300);
            if (houses) {
                setsWithHouses.filter(x => x.houses.some(y => houses.includes(y)));
            }
            if (setsWithHouses.length > 0) {
                deck = await fetchRandomDecks({ expansion: sample(setsWithHouses).set_number, houses });
            }
        } else {
            deck = await fetchRandomDecks({ expansion, houses });
        }
        if (deck) {
            embed.addField(
                `${deck.name} • ${sets.find(x => x.set_number === deck.expansion).flag}`,
                `${deck._links.houses.map(house => emoji(house.toLowerCase()))
                    .join(
                        ' • ')} • [Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`);

        }
    }

    await main.sendMessage({ message, embed });
    if (['decks', 'deck', 'decklists', 'dl', 'decklist'].some(x => flags.includes(x))) {
        await multiDeck({ message, params: decks.map(x => x.id), flags });
    }
};

module.exports = sealed;
