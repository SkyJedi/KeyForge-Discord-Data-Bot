const Discord = require('discord.js');
const {createCanvas, loadImage} = require('canvas');
const path = require('../config').path;
const _ = require('lodash');

const buildAttachment = async (data, name, lang, deck) => {
	if (0 >= data.length) return;

	//build new png
	const canvas = createCanvas((300 * data.length) + (data.length > 1 && 5 * data.length), 420);
	const ctx = canvas.getContext('2d');
	const imgArray = data.map(async card => {
		let cardImg = await loadImage(`${path}card_images/${lang}/${card.expansion}/${card.card_number}.png`);
		if (card.is_maverick) cardImg = await buildMav(cardImg, card);
		if (_.get(deck, 'set_era_cards.Legacy', []).includes(card.id)) cardImg = await buildLegacy(cardImg);
		return cardImg;
	});
	await Promise.all(imgArray).then(final => final.forEach((img, index) => ctx.drawImage(img, 300 * index + 5 * index, 0, 300, 420)));
	return new Discord.Attachment(canvas.toBuffer(), name);
};

const buildMav = (cardImg, card) => {
	return new Promise(resolve => {
		const maverick = loadImage(`${path}card_images/Maverick.png`),
			house = loadImage(`${path}card_images/${card.house}.png`);
		Promise.all([cardImg, maverick, house]).then(([cardImg, maverick, house]) => {
			const canvasMav = createCanvas(300, 420),
				ctxMav = canvasMav.getContext('2d');
			ctxMav.drawImage(cardImg, 0, 0);
			ctxMav.drawImage(house, 12, 11, 63, 63);
			ctxMav.drawImage(maverick, 232, 11, 63, 63);
			resolve(canvasMav);
		});
	});
};

const buildLegacy = (cardImg) => {
	return new Promise(resolve => {
		const legacy = loadImage(`${path}card_images/Legacy.png`);
		Promise.all([cardImg, legacy]).then(([cardImg, legacy]) => {
			const canvasMav = createCanvas(300, 420),
				ctxMav = canvasMav.getContext('2d');
			ctxMav.drawImage(cardImg, 0, 0);
			ctxMav.drawImage(legacy, 232, 330, 63, 78.75);
			resolve(canvasMav);
		});
	});
};

exports.buildAttachment = buildAttachment;