const main = require('../index');
const { fetchDeck, getFlagNumber } = require('./fetch');
const buildAttachment = require('./buildAttachment');
const { sortBy, sampleSize } = require('lodash');

const randomHand = ({ message, params, flags }) => {
    fetchDeck([params.join(' ')])
        .then(decks => {
            const number = getFlagNumber(flags, 6);
            const deck = decks[0];
            if (deck) {
                //grab 6 random cards
                let cards = deck.cards.filter(x => !x.is_non_deck);
                cards = sampleSize(cards, Math.min(number ? number : 6, 8));
                cards = sortBy(cards, ['house', 'card_number']);

                //build Title
                const name = cards.map(card => `${card.card_number}`).join('_') + '.jpg';
                const text = '**Random hand from ' + deck.name + '**';
                buildAttachment(cards, name, [...flags, 'random hand'])
                    .then(attachment => main.sendMessage(message, text, attachment));
            }
        }).catch(console.error);

};

module.exports = randomHand;
