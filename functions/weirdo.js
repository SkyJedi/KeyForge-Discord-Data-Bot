const { fetchCard, fetchMavCard, getFlagHouse, fetchDeckWithCard } = require('./fetch');
const { buildDeck } = require('./deck');

const weirdo = (msg, params, flags) => {
    const house = getFlagHouse(flags);
    const card = fetchCard(params.join(' '), flags);
    fetchMavCard(card.card_title, house)
        .then(mavCard => {
            fetchDeckWithCard(mavCard.id).then(deck => buildDeck(msg, deck, flags));
        }).catch(() => console.log('Card not found'));
};

exports.weirdo = weirdo;