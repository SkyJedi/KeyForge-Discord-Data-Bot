const main = require('../index');
const { fetchDeck, getFlagNumber } = require('./fetch');
const buildAttachment = require('./buildAttachment');
const { sortBy, sampleSize } = require('lodash');

const randomHand = async ({ message, params, flags }) => {
    const decks = await fetchDeck([params.join(' ')]);
    const number = getFlagNumber(flags, 6);
    const deck = decks.shift();
    if (deck) {
        //grab 6 random cards
        let cards = deck.cards.filter(x => !x.is_non_deck);
        cards = sampleSize(cards, Math.min(number ? number : 6, 8));
        cards = sortBy(cards, ['house', 'card_number']);

        //build Title
        const name = cards.map(card => `${card.card_number}`).join('_') + '.jpg';
        const text = '**Random hand from ' + deck.name + '**';
        const attachment = await buildAttachment(cards, name, [...flags, 'random hand']);
        await main.sendMessage({ message, text, attachment });
    }
};

module.exports = randomHand;
