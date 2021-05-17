const fs = require('fs');
const findEmoji = require('./emoji').findEmoji;
const adminID = require('../config').adminID;

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

const build = ({ message, client }) => {
    if (message.author.id !== adminID) return;
    const data = {};
    const process = emojiList.map(async type => {
        data[type] = await findEmoji(type, client);
    });
    Promise.all(process).then(() => {
        fs.writeFile(`./card_data/emoji.json`, JSON.stringify(data), () => {
            console.info('The file has been saved!');
            message.reply('EmojiDB has been built');
        });
    });
};

module.exports = build;
