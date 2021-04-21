const main = require('../index');
const {sortBy} = require('lodash')
const {fetchDeck} = require('./fetch');
const Deck = require('./deck').deck
const db = require('./firestore');

const et = async ({message, params}) => {
    const [deck] = await fetchDeck(params);
    if (deck.expansion < 496) return;
    deck.cards = sortBy(deck.cards, ['card_number']).reverse();
    let decksRef = db.collection('decks')
        .where('expansion', '==', deck.expansion)
        .where('_links.houses', '==', deck._links.houses)
        .orderBy('id').limit(10000);
    for (const card of deck.cards) {
        if (card.card_type !== 'Creature') {
            decksRef = decksRef.where('cards', 'array-contains', card.id);
            break;
        }
    }

    decksRef.get().then(snapshot => {
        let data = [], text = 'No Twin', winner;
        if (snapshot.size > 0) {
            snapshot.forEach(doc => data.push(doc.data()));
            const nonCreatureCards = deck.cards.filter(x => x.card_type !== 'Creature');
            for (const [_, query] of data.entries()) {
                if (query.name !== deck.name && nonCreatureCards.every(x => query.cards.includes(x.id))) {
                    text = `Twin Found!\n`;
                    winner = [query.id];
                    break;
                }
            }
            main.sendMessage(message, text);
            Deck({message, params: winner});
        }
    });
};

module.exports = et;
