const main = require('../index');
const { fetchSpoiler } = require('./fetch');

const spoiler = async ({ message, params }) => {
    //fetch cards data
    const cards = await fetchSpoiler(params.join(' '));
    if (0 >= cards.length) return;
    let text = `|| https://archonarcana.com/File:${cards[0].title.Image} ||`;
    main.sendMessage(message, text);
};

module.exports = spoiler;
