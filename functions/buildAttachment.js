const Discord = require('discord.js');
const { fabric } = require('fabric');
const path = require('path');
const { getFlagLang } = require('./fetch');
const width = 600, height = 840;

const buildAttachment = (data, name, flags) => new Promise(resolve => {
    if(0 >= data.length) resolve();
    const lang = getFlagLang(flags);
    const maverick = loadImage('../card_images/cardback/card_mavericks/Maverick.png');
    const legacy = loadImage('../card_images/cardback/Legacy.png');
    const cards = data.map(card => loadImage(`../card_images/${lang}/${card.expansion}/${card.card_number}.png`));
    const canvas = new fabric.StaticCanvas();
    canvas.setDimensions({ width: ((width * cards.length) + ((cards.length - 1) * 5)), height });

    Promise.all([maverick, legacy, ...cards]).then(([maverick, legacy, ...cards]) => {
        const finalImage = cards.map((card, index) => new Promise(async resolve1 => {
            const cardX = width * index + 5 * index;
            card.set({ left: cardX, top: 0 });
            canvas.add(card);

            if(data[index].is_maverick) {
                const mavHouse = await loadImage(`../card_images/cardback/card_mavericks/${data[index].house}.png`);
                mavHouse.set({ left: cardX });
                maverick.set({ left: cardX });
                canvas.add(mavHouse);
                canvas.add(maverick);
            }

            if(data[index].is_legacy) {
                legacy.scaleToWidth(100);
                legacy.set({ left: cardX + 500, top: 700 });
                canvas.add(legacy);
            }

            if(data[index].is_anomaly && flags.includes('random hand')) {
                const anomHouse = await loadImage(`../card_images/cardback/card_mavericks/${data[index].house}.png`);
                anomHouse.set({ left: cardX });
                canvas.add(anomHouse);
            }

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
