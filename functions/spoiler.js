const main = require('../index');
const { fetchSpoiler } = require('./fetch');

const spoiler = async ({msg, params}) => {
    //fetch cards data
    const cards = await fetchSpoiler(params.join(' '));
    if (0 >= cards.length) return;
    let text = `|| https://archonarcana.com/File:${cards[0].title.Image} ||`
    main.sendMessage(msg, text);
};

module.exports = spoiler;
