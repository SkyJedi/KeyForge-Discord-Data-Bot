const { fetchCard, fetchMavCard, getFlagHouses, fetchDeckWithCard } = require('./fetch');
const { buildDeck } = require('./deck');

const weirdo = async ({ message, params, flags }) => {
    const house = getFlagHouses(flags).shift();
    if (!house) return;
    flags = flags.filter(x => x !== house.toLowerCase());
    const card = fetchCard(params.join(' '));
    const mavCard = await fetchMavCard(card.card_title, house);
    const deck = await fetchDeckWithCard(mavCard.id, flags);
    await buildDeck(message, deck, flags);
};

module.exports = weirdo;
