const Discord = require('discord.js');
const { fabric } = require('fabric');
const path = require('path');
const { getFlagLang } = require('./fetch');
const { sets } = require('../card_data');

const buildAttachment = async (data, name, flags) => {
    if (0 >= data.length) return;
    let lang = getFlagLang(flags);
    let cards = [];
    for(const card of data) {
        const set = sets.find(x => x.set_number === card.expansion);
        if (!set.languages.includes(lang)) {
            lang = 'en';
        }
        let imgPath = `../card_images/${lang}/${card.expansion}/${card.card_number}`;
        if (card.expansion === 479) {
            //Dark Amber Vault and its coming
            if (card.card_number === '001' || card.card_number === '117') {
                imgPath += `-${card.house}`;
            }
            //Gigantics
            if (flags.includes('random hand') && (card.card_type === 'Creature1' || card.card_type === 'Creature2')) {
                imgPath += '-' + card.card_type.replace(/\D/g, '');
            }
        }
        imgPath += '.png';
        const image = await loadImage(imgPath);
        cards.push(image);
    }

    const canvas = new fabric.StaticCanvas();
    const width = cards.reduce((a, b) => b.width + a, 0);
    const height = cards.reduce((a, b) => b.height > a ? b.height : a, 840);
    canvas.setDimensions({ width: (width + ((cards.length - 1) * 5)), height });
    let cardX = 0;
    for(const [index, card] of cards.entries()) {
        const background = await loadImage('../card_images/cardback/blank_frame.png');
        background.set({ left: cardX, top: 0 });
        card.set({ left: cardX, top: 0 });
        canvas.add(background);
        canvas.add(card);
        if (data[index].is_maverick) {
            const maverick = await loadImage('../card_images/cardback/card_mavericks/Maverick.png');
            const mavHouse = await loadImage(`../card_images/cardback/card_mavericks/${data[index].house}.png`);
            mavHouse.set({ left: cardX });
            maverick.set({ left: cardX });
            canvas.add(mavHouse);
            canvas.add(maverick);
        }

        if (data[index].is_legacy) {
            const legacy = await loadImage('../card_images/cardback/Legacy.png');
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
        canvas.renderAll();
    }
    const stream = canvas.createJPEGStream();
    stream.on('end', () => canvas.dispose());
    return new Discord.MessageAttachment(stream, name);
};

const loadImage = (imgPath) => new Promise(resolve => fabric.Image.fromURL(`file://${path.join(__dirname, imgPath)}`, resolve));

module.exports = buildAttachment;
