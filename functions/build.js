const fs = require('fs');
const { findEmoji } = require('./emoji');
const { adminID } = require('../config');

const emojiList = [
    'action',
    'aember',
    'anomaly',
    'artifact',
    'brobnar',
    'capture',
    'chains',
    'common',
    'creature',
    'damage',
    'dis',
    'draw',
    'evil twin',
    'legacy',
    'logos',
    'mars',
    'maverick',
    'power',
    'rare',
    'sanctum',
    'saurian',
    'shadows',
    'special',
    'star alliance',
    'uncommon',
    'unfathomable',
    'untamed',
    'upgrade',
    'keyraken'
];

const build = async ({ message, client }) => {
    if (message.author.id !== adminID) return;
    const data = {};
    for (const type of emojiList) {
        data[type] = await findEmoji(type, client);
    }
    fs.writeFile(`./card_data/emoji.json`, JSON.stringify(data), () => {
        console.info('The file has been saved!');
        message.reply('EmojiDB has been built');
    });
};

module.exports = build;
