const main = require('../index');
const { fetchDeck, getFlagNumber } = require('./fetch');
const buildAttachment  = require('./buildAttachment');
const { shuffle, sortBy } = require('lodash');

const randomHand = ({msg, params, flags}) => {
    fetchDeck([params.join(' ')])
        .then(decks => {
            const number = getFlagNumber(flags, 6);
            const deck = decks[0];
            if(deck) {
                //grab 6 random cards
                const randomCards = sortBy(shuffle(deck.cards).slice(0, Math.min(number ? number : 6, 8)), ['house', 'card_number']);

                //build Title
                const name = randomCards.map(card => `${card.card_number}`).join('_') + '.jpg';
                const text = '**Random hand from ' + deck.name + '**';
                buildAttachment(randomCards, name, [...flags, 'random hand']).then(attachment => main.sendMessage(msg, text, attachment));
            }
        }).catch(console.error);

};

module.exports = randomHand;
