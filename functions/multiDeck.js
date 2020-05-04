const main = require('../index');
const Discord = require('discord.js');
const {buildDeckList} = require('./buildDeckList');
const { fetchDeck, getFlagLang } = require('./fetch');
const {createCanvas} = require('canvas');
const {snakeCase} = require('lodash');
const width = 600, height = 840;

const multiDeck = (msg, params, flags) => {
	const lang = getFlagLang(flags);
	if(0 >= params.length) return;
	fetchDeck(params).then(decks => {
		const deckImages = decks.filter(Boolean).map(deck => buildDeckList(deck, lang));
		Promise.all(deckImages).then(deckImages => {
			const canvas = createCanvas((width * decks.length) + (decks.length > 1 && 5 * decks.length), height);
			const ctx = canvas.getContext('2d');
			deckImages.forEach((img, index) => {
				ctx.drawImage(img, width * index + 5 * index, 0, width, height);
			});
			const name = decks.map(deck => snakeCase(deck.name)).join('_vs_') + '.jpg';
			const attachment = new Discord.Attachment(canvas.toBuffer('image/jpeg', {quality: 0.75}), name);
			main.sendMessage(msg, `**${decks.map(deck => deck.name).join('** vs **')}**`, attachment);
		});
	});
};

exports.multiDeck = multiDeck;
