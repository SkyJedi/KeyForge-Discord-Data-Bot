const { fabric } = require('fabric');
const QRCode = require('qrcode');
const path = require('path');
const { get } = require('lodash');

const { loadImage } = require('./fetch');
const card_titles = require('../card_data/card_titles');
const houses_languages = require('../card_data/houses_languages');
const { sets } = require('../card_data/');
const shadowProps = { color: 'gray', offsetX: 10, offsetY: 10, blur: 3 };
const fontProps = {
    fontWeight: 800,
    fontFamily: 'Keyforge',
    textAlign: 'left',
    fill: 'black',
    fontSize: 19
};

fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Oswald-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/ZCOOL-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Kanit-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Oswald-Bold.ttf'), {
    family: 'Keyforge',
    weight: 'bold',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/Kanit-Bold.ttf'), {
    family: 'Keyforge',
    weight: 'bold',
    style: 'normal'
});
fabric.nodeCanvas.registerFont(path.join(__dirname, '../fonts/BlackHanSans-Regular.ttf'), {
    family: 'Keyforge',
    weight: 'regular',
    style: 'normal'
});

const buildDeckList = async ({ houses, cards, expansion, language = 'en', ...deck }) => {
    let canvas = new fabric.StaticCanvas();
    canvas.setDimensions({ width: 600, height: 840 });

    const Common = await loadImage('cardback/rarity/Common.png');
    const Rare = await loadImage('cardback/rarity/Rare.png');
    const Special = await loadImage('cardback/rarity/Special.png');
    const Uncommon = await loadImage('cardback/rarity/Uncommon.png');
    const Action = await loadImage('cardback/action.png');
    const Artifact = await loadImage('cardback/artifact.png');
    const Upgrade = await loadImage('cardback/upgrade.png');
    const Creature = await loadImage('cardback/creature.png');
    const Evil_Twin = await loadImage('cardback/evil-twin.png');
    const cardBack = await loadImage('cardback/decklist.png');
    const crest = await loadImage('cardback/crest.png');
    const set = await loadImage(`cardback/${sets.find(x => x.set_number === expansion)
        .flag
        .toLowerCase()}.png`);

    const houseData = {
        size: 35,
        0: { x: 55, y: 132 },
        1: { x: 55, y: 510 },
        2: { x: 310, y: 227 }
    };

    const cardData = {
        size: 19,
        start: { x: 50, y: 173 }
    };

    const lineStyle = { fill: 'black', stroke: 'black', strokeWidth: 2 };

    let qrCode;
    await QRCode.toCanvas(fabric.util.createCanvasElement(),
        `https://www.keyforgegame.com/deck-details/${deck.id}`,
        { margin: 3 }, (err, qr) => qrCode = new fabric.Image(qr));

    const title = curvedText(deck.name, 1700, 75);
    const line1 = new fabric.Line([55, 165, 295, 165], lineStyle);
    const line2 = new fabric.Line([55, 543, 295, 543], lineStyle);
    const line3 = new fabric.Line([310, 260, 550, 260], lineStyle);
    const text = new fabric.Text('DECK LIST', { ...fontProps, fontWeight: 200 });
    const Rarities = { Common, Uncommon, Rare, Special, 'Evil Twin': Evil_Twin };
    const CardTypes = { Action, Artifact, Creature, Evil_Twin, Upgrade };

    cardBack.scaleToWidth(600);
    text.set({ left: 255, top: 100 });
    qrCode.set({ left: 331, top: 614 }).scaleToWidth(150);
    set.set({ left: 232, top: 98 }).scaleToWidth(20);
    crest.set({ left: 504, top: 749 }).scaleToWidth(50);

    canvas.add(cardBack, line1, line2, line3, qrCode, set, title, text, crest);

    for (const [index, house] of houses.sort().entries()) {
        const img = await loadImage(`cardback/decklist_houses/${house}.png`);
        img.set({
            left: houseData[index].x,
            top: houseData[index].y,
            shadow: new fabric.Shadow(shadowProps)
        })
            .scaleToWidth(30)
            .scaleToHeight(30);
        const houseText = new fabric.Text(houses_languages[language][house], {
            fontWeight: language === 'ko' ? 100 : 800,
            fontFamily: 'Keyforge',
            textAlign: 'left',
            fillStyle: 'black',
            fontSize: 25
        }).set({ left: houseData[index].x + 35, top: houseData[index].y + 5 });
        canvas.add(houseText, img);
    }

    for (const [index, card] of cards.filter(x => !x.is_non_deck).entries()) {
        let x = cardData.start.x,
            y = cardData.start.y + (index * 28);
        const name = get(card_titles, `[${card.expansion}][${card.card_number}][${language}]`, card.card_title);
        if (index > 11) {
            y = y + 45;
        }

        if (index > 20) {
            x = 300;
            y = cardData.start.y + ((index - 22.1) * 28);
        }

        if (index > 23) {
            y = y + 44;
        }

        const rarity = new fabric.Image(Rarities[card.rarity === 'FIXED' || card.rarity ===
        'Variant' ? 'Special' : card.rarity].toCanvasElement())
            .set({ left: x, top: y, shadow: new fabric.Shadow(shadowProps) })
            .scaleToWidth(cardData.size);

        const number = new fabric.Text(card.card_number, {
                ...fontProps,
                fill: card.is_enhanced ? '#0081ad' : 'black'
            }
        )
            .set({
                left: x + rarity.getScaledWidth() + 2,
                top: y
            });

        const typeIcon = new fabric.Image(CardTypes[card.card_type.replace(/\d+/g, '')].toCanvasElement());
        typeIcon.scaleToWidth(cardData.size)
            .set({
                left: x + rarity.getScaledWidth() + 32 + 2,
                top: y,
                shadow: new fabric.Shadow({ ...shadowProps, offsetX: 1, offsetY: 1, blur: 1 })
            });

        const title = new fabric.Text(name, {
            ...fontProps,
            fontWeight: 300,
            fill: card.is_enhanced ? '#0081ad' : 'black'
        }).set({
            left:
                x +
                rarity.getScaledWidth() +
                32 +
                typeIcon.getScaledWidth() +
                2,
            top: y
        });

        canvas.add(number, rarity, title, typeIcon);

        let iconX =
            x +
            rarity.getScaledWidth() +
            32 +
            typeIcon.getScaledWidth() +
            title.getScaledWidth() +
            4;

        if (card.is_maverick) {
            const maverick = await loadImage('cardback/Maverick.png');
            const maverickImage = new fabric.Image(maverick.toCanvasElement())
                .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                .scaleToHeight(cardData.size);
            canvas.add(maverickImage);
            iconX = iconX + maverickImage.getScaledWidth();
        }

        if (card.is_legacy) {
            const legacy = await loadImage('cardback/Legacy.png');
            const legacyImage = new fabric.Image(legacy.toCanvasElement())
                .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                .scaleToHeight(cardData.size);
            canvas.add(legacyImage);
            iconX = iconX + legacyImage.getScaledWidth();
        }

        if (card.is_anomaly) {
            const anomaly = await loadImage('cardback/Anomaly.png');
            const anomalyImage = new fabric.Image(anomaly.toCanvasElement())
                .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                .scaleToHeight(cardData.size);
            canvas.add(anomalyImage);
        }

        if (card.enhancements) {
            for (const enhancement of card.enhancements) {
                const enhancementImg = await loadImage(`cardback/enhancements/${enhancement}.png`);
                const enhancementElement = new fabric.Image(enhancementImg.toCanvasElement())
                    .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                    .scaleToHeight(cardData.size);
                canvas.add(enhancementElement);
                iconX = iconX + enhancementElement.getScaledWidth();
            }
        }

    }

    canvas.renderAll();

    return canvas;
};

const getCurvedFontSize = (length) => {
    if (length < 30) return 42;
    return 35 / (length / 35);
};

const curvedText = (text = '', diameter, yOffset = 0) => {
    const canvas = fabric.util.createCanvasElement();

    let ctx = canvas.getContext('2d');
    let textHeight = 40, startAngle = 0;

    canvas.width = 600;
    canvas.height = 800;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    ctx.shadowColor = 'rgb(32,32,32)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.font = `${getCurvedFontSize(text.length)}px Keyforge`;

    text = text.split('').reverse().join('');

    ctx.translate(300, Math.max((diameter + yOffset) / 2, 400 + yOffset)); // Move to center
    ctx.textBaseline = 'middle'; // Ensure we draw in exact center
    ctx.textAlign = 'center'; // Ensure we draw in exact center

    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width;
        startAngle += (charWid) / (diameter / 2 - textHeight) / 2;
    }

    ctx.rotate(startAngle);

    for (let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width; // half letter
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
        ctx.fillText(text[j], 0, (0 - diameter / 2 + textHeight / 2));
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1); // rotate half letter
    }

    return new fabric.Image(canvas, { left: 0, top: 0 });
};

module.exports = buildDeckList;
