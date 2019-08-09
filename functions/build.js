const fs = require('fs');
const findEmoji = require('./emoji').findEmoji;
const adminID = require('../config').adminID;

const emojiList = [
	'dis', 'logos', 'mars', 'brobnar', 'untamed', 'shadows', 'sanctum',
	'armor', 'damage', 'power', 'maverick', 'chains', 'aember', 'keyforge',
	'common', 'uncommon', 'rare', 'special', 'legacy', 'saurian', 'staralliance', 'rage', 'ward',
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