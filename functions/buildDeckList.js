const {get} = require('lodash');
const {createCanvas, loadImage, registerFont} = require('canvas');
const path = require('path');
const card_titles = require('../card_data/card_titles');

new registerFont(path.join(__dirname, '../fonts/Oswald-Regular.ttf'), {family: 'allFonts'});
new registerFont(path.join(__dirname, '../fonts/Oswald-Bold.ttf'), {family: 'allFontsBold'});
new registerFont(path.join(__dirname, '../fonts/ZCOOL-Regular.ttf'), {family: 'allFonts'});
new registerFont(path.join(__dirname, '../fonts/Kanit-Regular.ttf'), {family: 'allFonts'});
new registerFont(path.join(__dirname, '../fonts/Kanit-Bold.ttf'), {family: 'allFontsBold'});

const buildDeckList = ({houses, cards, ...deck}, lang = 'en') => {
	return new Promise(res => {
		const canvas = createCanvas(600, 840),
			ctx = canvas.getContext('2d'),
			cardBack = loadImage(path.join(__dirname, '../card_images/decklist.png')),
			Common = loadImage(path.join(__dirname, `../card_images/Common.png`)),
			Uncommon = loadImage(path.join(__dirname, `../card_images/Uncommon.png`)),
			Rare = loadImage(path.join(__dirname, `../card_images/Rare.png`)),
			Special = loadImage(path.join(__dirname, `../card_images/Special.png`)),
			maverick = loadImage(path.join(__dirname, `../card_images/Maverick.png`)),
			legacy = loadImage(path.join(__dirname, `../card_images/Legacy.png`)),
			houseData = {
				size: 35,
				0: {x: 55, y: 120},
				1: {x: 55, y: 498},
				2: {x: 310, y: 215},
			},
			cardData = {
				size: 20,
				start: {x: 60, y: 185}
			};

		Promise.all([cardBack, maverick, legacy, Common, Uncommon, Rare, Special]).then(([cardBack, maverick, legacy, Common, Uncommon, Rare, Special]) => {
			const Rarities = {Common, Uncommon, Rare, Special};
			ctx.drawImage(cardBack, 0, 0);

			const houseProm = houses.map((house, index) => {
				return new Promise(async res1 => {
					const img = await loadImage(path.join(__dirname, `../card_images/${house}.png`));
					ctx.drawImage(img, houseData[index].x, houseData[index].y, houseData.size, houseData.size);
					ctx.fillStyle = 'black';
					ctx.font = `25px allFontsBold`;
					ctx.textAlign = 'left';
					ctx.fillText(house, houseData[index].x + 40, houseData[index].y + 28);
					res1();
				});

			});

			const cardProm = cards.map((card, index) => {
				return new Promise(async res2 => {
					const title = get(card_titles, `[${card.expansion}][${card.card_number}][${lang}]`, card.card_title);
					let x = cardData.start.x,
						y = cardData.start.y + (index * 28);
					if (index > 11) y = y + 45;
					if (index > 20) {
						x = x + 245;
						y = cardData.start.y + ((index - 22.5) * 28);
					}
					if (index > 23) y = y + 52;
					ctx.drawImage((Rarities[card.rarity === 'FIXED' || card.rarity === 'Variant' ? 'Special' : card.rarity]), x, y - 19, cardData.size, cardData.size);
					ctx.fillStyle = 'black';
					ctx.font = `20px allFontsBold`;
					ctx.textAlign = 'left';
					ctx.fillText(card.card_number, x + 22, y);
					ctx.font = `20px allFonts`;
					ctx.fillText(title, x + 60, y);
					if (card.is_maverick) ctx.drawImage(maverick, x + ((title.length * 6) + 100), y - 18, cardData.size, cardData.size);
					if (card.is_legacy) ctx.drawImage(legacy, x + ((title.length * 6) + 100) + (card.is_maverick ? 20 : 0), y - 18, cardData.size, cardData.size);
					res2();
				});
			});
			ctx.drawImage((getCircularText(deck.name, 2000, 0)), -700, 30);
			Promise.all([...houseProm, ...cardProm]).then(() => {
				res(canvas);
			});
		});

	});
};

const getCurvedFontSize = (length) => {
	const size = (30 / length) * 30;
	if (size > 30) return 40;
	return size;
};

const getCircularText = (text, diameter, kerning) => {
	let canvas = createCanvas(600, 840);
	let ctx = canvas.getContext('2d');
	let textHeight = 40, startAngle = 0;

	canvas.width = diameter;
	canvas.height = diameter;
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'grey';
	ctx.font = `${getCurvedFontSize(text.length)}px allFonts`;

	text = text.split("").reverse().join("");

	ctx.translate(diameter / 2, diameter / 2); // Move to center
	ctx.textBaseline = 'middle'; // Ensure we draw in exact center
	ctx.textAlign = 'center'; // Ensure we draw in exact center

	for (let j = 0; j < text.length; j++) {
		let charWid = ctx.measureText(text[j]).width;
		startAngle += ((charWid + (j === text.length - 1 ? 0 : kerning)) / (diameter / 2 - textHeight)) / 2;
	}

	ctx.rotate(startAngle);

	for (let j = 0; j < text.length; j++) {
		let charWid = ctx.measureText(text[j]).width; // half letter
		ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
		ctx.fillText(text[j], 0, (0 - diameter / 2 + textHeight / 2));
		ctx.rotate((charWid / 2 + kerning) / (diameter / 2 - textHeight) * -1); // rotate half letter
	}
	return canvas;
};

exports.buildDeckList = buildDeckList;