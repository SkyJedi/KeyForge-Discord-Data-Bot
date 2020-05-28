const Discord = require('discord.js');
const { fabric } = require('fabric');
const path = require('path');
const { getFlagLang } = require('./fetch');

const buildAttachment = (data, name, flags) => new Promise(async resolve => {
    if (0 >= data.length) resolve();
    const lang = getFlagLang(flags);
    const maverick = loadImage('../card_images/cardback/card_mavericks/Maverick.png');
    const legacy = loadImage('../card_images/cardback/Legacy.png');
    const cards = data.map(card => {
        let imgPath = `../card_images/${lang}/${card.expansion}/${card.card_number}`;
        if (card.expansion === 479) {
            //Dark Amber Vault and its coming
            if (card.card_number === '001'|| card.card_number === '117') {
                imgPath += `-${card.house}`;
            }
            //Gigantics
            if (flags.includes('random hand') && (card.card_type === 'Creature1' || card.card_type === 'Creature2')) {
                imgPath += '-' + card.card_type.replace(/\D/g, '');
            }
        }
        imgPath += '.png';
        return loadImage(imgPath);
    });

    Promise.all([maverick, legacy, ...cards]).then(([maverick, legacy, ...cards]) => {
        const canvas = new fabric.StaticCanvas();
        const width = cards.reduce((a, b) => b.width + a, 0);
        const height = cards.reduce((a, b) => b.height > a ? b.height : a, 840);
        canvas.setDimensions({ width: (width + ((cards.length - 1) * 5)), height });
        canvas.setBackgroundColor('#3f4037');
        let cardX = 0;
        const finalImage = cards.map((card, index) => new Promise(async resolve1 => {
            card.set({ left: cardX, top: 0 });
            canvas.add(card);
            if (data[index].is_maverick) {
                const mavHouse = await loadImage(`../card_images/cardback/card_mavericks/${data[index].house}.png`);
                mavHouse.set({ left: cardX });
                maverick.set({ left: cardX });
                canvas.add(mavHouse);
                canvas.add(maverick);
            }

            if (data[index].is_legacy) {
                legacy.scaleToWidth(100);
                legacy.set({ left: cardX + 500, top: 700 });
                canvas.add(legacy);
            }

            if (data[index].is_anomaly && flags.includes('random hand')) {
                const anomHouse = await loadImage(`../card_images/cardback/card_mavericks/${data[index].house}.png`);
                anomHouse.set({ left: cardX });
                canvas.add(anomHouse);
            }
            cardX += card.width + 5;

            resolve1(canvas);
        }));
        Promise.all(finalImage).then(() => {
            const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.6 }).replace('data:image/jpeg;base64,', '');
            const attachment = new Discord.MessageAttachment(Buffer.from(dataUrl, 'base64'), name);
            resolve(attachment);
        });
    });
});

const loadImage = (imgPath) => {
    return new Promise(resolve => fabric.Image.fromURL(`file://${path.join(__dirname, imgPath)}`, image => resolve(image)));
};

exports.buildAttachment = buildAttachment;
