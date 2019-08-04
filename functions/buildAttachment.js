const Discord = require('discord.js');
const {createCanvas, loadImage} = require('canvas');
const path = require('path');
const _ = require('lodash');
const getFlagLang = require('./fetch').getFlagLang;
const width = 600, height = 840;

const buildAttachment = async (data, name, flags, deck) => {
	if (0 >= data.length) return;
	const lang = getFlagLang(flags);

	//build new png
	const canvas = createCanvas((width * data.length) + (data.length > 1 && 5 * data.length), height);
	const ctx = canvas.getContext('2d');
	const imgArray = data.map(async card => {
		const canvasCard = createCanvas(width, height),
			ctxCard = canvasCard.getContext('2d'),
			cardImg = await loadImage(path.join(__dirname, `../card_images/${lang}/${card.expansion}_HD/${card.card_number}.png`));

		ctxCard.drawImage(cardImg, 0, 0, width, height);

		if (card.is_maverick) {
			const maverick = await loadImage(path.join(__dirname, `../card_images/card_Maverick.png`)),
				house = await loadImage(path.join(__dirname, `../card_images/${card.house}.png`));
			ctxCard.drawImage(house, 24, 22, 126, 126);
			ctxCard.drawImage(maverick, -14, 10, 600, 840);
		}

		if (_.get(deck, 'set_era_cards.Legacy', []).includes(card.id)) {
			const legacy = await loadImage(path.join(__dirname, `../card_images/Legacy.png`));
			ctxCard.drawImage(legacy, 232, 330, 126, 157.5);
		}

		return canvasCard;
	});

	await Promise.all(imgArray).then(final => final.forEach((img, index) => ctx.drawImage(img, width * index + 5 * index, 0, width, height)));

	return new Discord.Attachment(canvas.toBuffer(), name);
};
exports.buildAttachment = buildAttachment;