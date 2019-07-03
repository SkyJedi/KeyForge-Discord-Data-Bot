const Discord = require('discord.js');
const {createCanvas, loadImage} = require('canvas');
const path = require('path');
const _ = require('lodash');
const getFlagLang = require('./fetch').getFlagLang;

const buildAttachment = async (data, name, flags, deck) => {
	if (0 >= data.length) return;
	const lang = getFlagLang(flags);

	//build new png
	const canvas = createCanvas((600 * data.length) + (data.length > 1 && 5 * data.length), 840);
	const ctx = canvas.getContext('2d');
	const imgArray = data.map(async card => {
		let cardImg = await loadImage(path.join(__dirname, `../card_images/${lang}/${card.expansion}_HD/${card.card_number}.png`));
		if (card.is_maverick) cardImg = await buildMav(cardImg, card);
		if (_.get(deck, 'set_era_cards.Legacy', []).includes(card.id)) cardImg = await buildLegacy(cardImg);
		return cardImg;
	});
	await Promise.all(imgArray).then(final => final.forEach((img, index) => ctx.drawImage(img, 600 * index + 5 * index, 0, 600, 840)));
	return new Discord.Attachment(canvas.toBuffer(), name);
};

const buildMav = (cardImg, card) => {
	return new Promise(resolve => {
		const maverick = loadImage(path.join(__dirname, `../card_images/Maverick.png`)),
			house = loadImage(path.join(__dirname, `../card_images/${card.house}.png`));
		Promise.all([cardImg, maverick, house]).then(([cardImg, maverick, house]) => {
			const canvasMav = createCanvas(600, 840),
				ctxMav = canvasMav.getContext('2d');
			ctxMav.drawImage(cardImg, 0, 0);
			ctxMav.drawImage(house, 24, 22, 126, 126);
			ctxMav.drawImage(maverick, 464, 22, 126, 126);
			resolve(canvasMav);
		});
	});
};

const buildLegacy = (cardImg) => {
	return new Promise(resolve => {
		const legacy = loadImage(path.join(__dirname, `../card_images/Legacy.png`));
		Promise.all([cardImg, legacy]).then(([cardImg, legacy]) => {
			const canvasMav = createCanvas(600, 840),
				ctxMav = canvasMav.getContext('2d');
			ctxMav.drawImage(cardImg, 0, 0);
			ctxMav.drawImage(legacy, 464, 660, 126, 157.5);
			resolve(canvasMav);
		});
	});
};

exports.buildAttachment = buildAttachment;