const main = require('../index');
const Discord = require('discord.js');
const {buildDeckList} = require('./buildDeckList');
const {fetchDeck, fetchDeckBasic, getFlagLang} = require('./fetch');
const {createCanvas} = require('canvas');
const {snakeCase} = require('lodash');
const width = 600, height = 840;

const multiDeck = async (msg, params, flags) => {
	const lang = getFlagLang(flags);
	if (0 >= params.length) return;
	const decks = params.map(id => {
		if (/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/.test(id)) return fetchDeckBasic(id, lang);
		else return fetchDeck(id.split(' ').filter(Boolean).join('+'), lang);
	});
	Promise.all(decks).then(decks => {
		const deckImages = decks.filter(Boolean).map(deck => buildDeckList(deck, lang));
		Promise.all(deckImages).then(deckImages => {
			const canvas = createCanvas((width * decks.length) + (decks.length > 1 && 5 * decks.length), height);
			const ctx = canvas.getContext('2d');
			deckImages.forEach((img, index) => {
				ctx.drawImage(img, width * index + 5 * index, 0, width, height);
			});
			const name = decks.map(deck => snakeCase(deck.name)).join('_vs_') + '.png';
			const attachment = new Discord.Attachment(canvas.toBuffer(), name);
			main.sendMessage(msg, `**${decks.map(deck => deck.name).join('** vs **')}**`, attachment);
		});
	});

};

exports.multiDeck = multiDeck;