const fs = require('fs');
const findEmoji = require('./emoji').findEmoji;
const adminID = require('../config').adminID;

const emojiList = [
    'aember',
    'anomaly',
    'armor',
    'brobnar',
    'capture',
    'chains',
    'common',
    'damage',
    'dis',
    'draw',
    'enrage',
    'keyforge',
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
    'untamed',
    'ward'
];

const build = (msg, params, flags, bot) => {
    if (msg.author.id !== adminID) return;
    const data = {};
    const process = emojiList.map(async type => {
        data[type] = await findEmoji(type, bot);
    });
    Promise.all(process).then(() => {
        fs.writeFile(`./card_data/emoji.json`, JSON.stringify(data), () => {
            console.log('The file has been saved!');
            msg.reply('EmojiDB has been built');
        });
    });
};

exports.build = build;
