const { fetchCard, fetchMavCard, getFlagHouse, fetchDeckWithCard } = require('./fetch');
const { buildDeck } = require('./deck');

const weirdo = async ({message, params, flags}) => {
    const house = getFlagHouse(flags);
    if (!house) return;
    flags = flags.filter(x => x !== house.toLowerCase())
    const card = fetchCard(params.join(' '));
    const mavCard = await fetchMavCard(card.card_title, house);
    const deck = await fetchDeckWithCard(mavCard.id)
    buildDeck(message, deck, flags);
};

module.exports = weirdo;
