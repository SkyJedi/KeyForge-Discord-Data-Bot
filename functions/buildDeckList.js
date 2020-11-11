const { fabric } = require('fabric');
const QRCode = require('qrcode');
const path = require('path');
const card_titles = require('../card_data/card_titles');
const houses_languages = require('../card_data/houses_languages');
const { sets } = require('../card_data/index');
const { get } = require('lodash');
const shadowProps = { color: 'gray', offsetX: 10, offsetY: 10, blur: 3 };


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

const buildDeckList = ({ houses, cards, expansion, ...deck }, lang = 'en') => {
    return new Promise(async res => {
        const canvas = new fabric.StaticCanvas('decklist');
        canvas.setDimensions({ width: 600, height: 840 });
        const Common = loadImage('../card_images/cardback/rarity/Common.png');
        const Rare = loadImage('../card_images/cardback/rarity/Rare.png');
        const Special = loadImage('../card_images/cardback/rarity/Special.png');
        const Uncommon = loadImage('../card_images/cardback/rarity/Uncommon.png');
        const cardBack = loadImage('../card_images/cardback/decklist.png');
        const set = loadImage(`../card_images/cardback/${sets.find(x => x.set_number === expansion)
                                                             .flag
                                                             .toLowerCase()}.png`);
        const crest = loadImage('../card_images/cardback/crest.png');

        const houseData = {
            size: 35,
            0: { x: 55, y: 124 },
            1: { x: 55, y: 502 },
            2: { x: 310, y: 219 }
        };
        const cardData = {
            size: 20,
            start: { x: 58, y: 165 }
        };
        const qrCode = new Promise(qrRes => {
            QRCode.toCanvas(fabric.util.createCanvasElement(),
                `https://www.keyforgegame.com/${deck.uuid}`,
                { margin: 0 }, (err, qr) => qrRes(new fabric.Image(qr)))
        });

        const title = getCircularText(deck.name, 1700, 60);
        Promise.all([cardBack, Common, Uncommon, Rare, Special, set, title, crest, qrCode])
               .then(([cardBack, Common, Uncommon, Rare, Special, set, title, crest, qrCode]) => {
                   const Rarities = { Common, Uncommon, Rare, Special };
                   qrCode.set({ left: 331, top: 614 }).scaleToWidth(150);
                   set.set({ left: 232, top: 92 }).scaleToWidth(20);
                   crest.set({ left: 500, top: 735 }).scaleToWidth(50);
                   title.set({ left: 0 });
                   canvas.add(cardBack)
                         .add(qrCode)
                         .add(set)
                         .add(title)
                         .add(crest);

                   const houseProm = houses.sort().map((house, index) => {
                       return new Promise(houseRes => {
                           loadImage(`../card_images/cardback/decklist_houses/${house}.png`).then(img => {
                               img.set({ left: houseData[index].x, top: houseData[index].y, shadow: new fabric.Shadow(shadowProps)})
                                  .scaleToWidth(30)
                                  .scaleToHeight(30);                              

                               const houseText = new fabric.Text(houses_languages[lang][house], {
                                   fontWeight: lang === 'ko' ? 100 : 800,
                                   fontFamily: 'Keyforge',
                                   textAlign: 'left',
                                   fillStyle: 'black',
                                   fontSize: 25
                               }).set({ left: houseData[index].x + 35, top: houseData[index].y + 5 });
                               canvas.add(houseText).add(img);
                               houseRes();
                           });
                       });
                   });

                   const cardProm = cards.map((card, index) => {
                       return new Promise(async cardRes => {
                           let x = cardData.start.x,
                               y = cardData.start.y + (index * 28);
                           const name = get(card_titles, `[${card.expansion}][${card.card_number}][${lang}]`, card.card_title);
                           if (index > 11) {
                               y = y + 45;
                           }

                           if (index > 20) {
                               x = x + 249;
                               y = cardData.start.y + ((index - 22.1) * 28);
                           }

                           if (index > 23) {
                               y = y + 44;
                           }

                           const fontProps = {
                               fontWeight: 800,
                               fontFamily: 'Keyforge',
                               textAlign: 'left',
                               fill: 'black',
                               fontSize: 20
                           };
                           const rarity = new fabric.Image(Rarities[card.rarity === 'FIXED' || card.rarity ===
                                                                    'Variant' ? 'Special' : card.rarity].getElement())
                               .set({ left: x, top: y,  shadow: new fabric.Shadow(shadowProps) })
                               .scaleToWidth(cardData.size)
                           const number = new fabric.Text(card.card_number, fontProps).set({ left: x + 22, top: y });

                           if (card.is_enhanced) {
                               fontProps.fill = '#0081ad';
                           }

                           const title = new fabric.Text(name, {
                               ...fontProps,
                               fontWeight: 300
                           }).set({ left: x + 60, top: y });

                           canvas.add(number).add(rarity).add(title);

                           let iconX = x + title.width + number.width + 35;

                           if (card.is_maverick) {
                               const maverick = await loadImage('../card_images/cardback/Maverick.png');
                               const maverickImage = new fabric.Image(maverick.getElement())
                                   .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                                   .scaleToHeight(cardData.size);
                               canvas.add(maverickImage);
                               iconX = iconX + 20;
                           }

                           if (card.is_legacy) {
                               const legacy = await loadImage('../card_images/cardback/Legacy.png');
                               const legacyImage = new fabric.Image(legacy.getElement())
                                   .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                                   .scaleToHeight(cardData.size);
                               canvas.add(legacyImage);
                           }

                           if (card.is_anomaly) {
                               const anomaly = await loadImage('../card_images/cardback/Anomaly.png');
                               const anomalyImage = new fabric.Image(anomaly.getElement())
                                   .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                                   .scaleToHeight(cardData.size);
                               canvas.add(anomalyImage);
                           }

                           if (card.enhancements) {
                               for(const enhancement of card.enhancements) {
                                   const enhancementImg = await loadImage(`../card_images/cardback/enhancements/${enhancement}.png`);
                                   const enhancementElement = new fabric.Image(enhancementImg.getElement())
                                       .set({ left: iconX, top: y, shadow: new fabric.Shadow(shadowProps) })
                                       .scaleToHeight(cardData.size);
                                   canvas.add(enhancementElement);
                                   iconX = iconX + 25;
                               }
                           }

                           cardRes();
                       });
                   });

                   Promise.all([...houseProm, ...cardProm]).then(() => {
                       canvas.renderAll();
                       res(canvas);
                   });
               });
    });
};

const getCurvedFontSize = (length) => {
    if (length < 30) return 42;
    return 35 / (length / 35);
};

const loadImage = (imgPath) => new Promise(resolve => fabric.Image.fromURL(`file://${path.join(__dirname, imgPath)}`, resolve));


const getCircularText = (text = '', diameter, yOffset = 0) => {
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

    for(let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width;
        startAngle += (charWid) / (diameter / 2 - textHeight) / 2;
    }

    ctx.rotate(startAngle);

    for(let j = 0; j < text.length; j++) {
        let charWid = ctx.measureText(text[j]).width; // half letter
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1);
        ctx.fillText(text[j], 0, (0 - diameter / 2 + textHeight / 2));
        ctx.rotate((charWid / 2) / (diameter / 2 - textHeight) * -1); // rotate half letter
    }

    return new fabric.Image(canvas, { left: 0, top: 0 });
};

module.exports = buildDeckList;
