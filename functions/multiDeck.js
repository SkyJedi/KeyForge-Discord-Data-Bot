const main = require('../index');
const Discord = require('discord.js');
const { buildDeckList } = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const { fabric } = require('fabric');

const { snakeCase } = require('lodash');
const width = 600, height = 840;

const multiDeck = (msg, params, flags) => {
    const lang = getFlagLang(flags);
    if(0 >= params.length) return;
    fetchDeck(params).then(decks => {
        const deckImages = decks.filter(Boolean).map(deck => buildDeckList(deck, lang));
        Promise.all(deckImages).then(deckImages => {
            const canvas = new fabric.StaticCanvas('multiDeck');
            canvas.setDimensions({ width: ((width * decks.length) + (decks.length > 1 && 5 * decks.length)), height });
            const decklists = deckImages.map(img => new Promise(resolve => fabric.Image.fromURL(img.toDataURL(), image => resolve(image))));
            Promise.all(decklists).then(decklists => {
                decklists.forEach((img, index) => {
                    img.set({ left: width * index + 5 * index, top: 0 });
                    canvas.add(img);
                });
                const name = decks.map(deck => snakeCase(deck.name)).join('_vs_') + '.png';
                const attachment = new Discord.Attachment(Buffer.from(canvas.toDataURL()
                    .replace('data:image/png;base64', ''), 'base64'), name);
                main.sendMessage(msg, `**${decks.map(deck => deck.name).join('** vs **')}**`, attachment);
            });
        });
    });
};

exports.multiDeck = multiDeck;
