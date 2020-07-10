const { fetchCard, fetchMavCard, getFlagHouse, fetchDeckWithCard } = require('./fetch');
const { buildDeck } = require('./deck');

const weirdo = async (msg, params, flags) => {
    const house = getFlagHouse(flags);
    flags = flags.filter(x => x !== house.toLowerCase())
    const card = fetchCard(params.join(' '), flags);
    const mavCard = await fetchMavCard(card.card_title, house);
    const deck = await fetchDeckWithCard(mavCard.id)
    buildDeck(msg, deck, flags);
};

exports.weirdo = weirdo;
