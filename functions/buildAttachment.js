const Discord = require('discord.js');
const {createCanvas, loadImage} = require('canvas');
const path = require('../config').path;

const buildAttachment = async (data, name, lang) => {
	if (0 >= data.length) return;
	//build new png
	const canvas = createCanvas(250 * data.length + 5 * data.length, 350);
	const ctx = canvas.getContext('2d');
	const imgArray = data.map(async card => {
		if (!card.is_maverick) return await loadImage(`${path}card_images/${lang}/${card.expansion}/${card.card_number}.png`);
		else {
			return new Promise(resolve => {
				const cardMav = loadImage(`${path}card_images/${lang}/${card.expansion}/${card.card_number}.png`),
					maverick = loadImage(`${path}card_images/Maverick.png`),
					house = loadImage(`${path}card_images/${card.house}.png`);
				Promise.all([cardMav, maverick, house]).then(([cardMav, maverick, house]) => {
					const canvasMav = createCanvas(300, 420),
						ctxMav = canvasMav.getContext('2d');
					ctxMav.drawImage(cardMav, 0, 0);
					ctxMav.drawImage(house, 12, 11, 63, 63);
					ctxMav.drawImage(maverick, 232, 11, 63, 63);
					resolve(canvasMav);
				});
			})

		}
	});
	await Promise.all(imgArray).then(final => final.forEach((img, index) => ctx.drawImage(img, 250 * index + 5 * index, 0, 250, 350)));
	return new Discord.Attachment(canvas.toBuffer(), name);
};

exports.buildAttachment = buildAttachment;