const main = require('../index');
const Discord = require('discord.js');
const buildDeckList = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const { fabric } = require('fabric');

const { snakeCase } = require('lodash');
const width = 600, height = 840;

const multiDeck = async ({msg, params, flags}) => {
    const lang = getFlagLang(flags);
    if (0 >= params.length) return;
    const canvas = new fabric.StaticCanvas('multiDeck');
    let decks;
    try {
        decks = await fetchDeck(params);
    } catch(err){
        return;
    }
    canvas.setDimensions({ width: ((width * decks.length) + (decks.length > 1 && 5 * decks.length)), height });
    for (const [index, deck] of decks.entries()) {
        const image = await buildDeckList(deck, lang)
        const img = new fabric.Image(image.getElement());
        img.set({ left: width * index + 5 * index, top: 0 });
        canvas.add(img);
    }
    canvas.renderAll();
    const name = decks.map(deck => snakeCase(deck.name)).join('_vs_') + '.jpg';
    const stream = canvas.createJPEGStream()
    stream.on('end', () => canvas.dispose());
    const attachment = new Discord.MessageAttachment(stream, name);
    main.sendMessage(msg, `**${decks.map(deck => deck.name).join('** vs **')}**`, attachment);
};

module.exports = multiDeck;
