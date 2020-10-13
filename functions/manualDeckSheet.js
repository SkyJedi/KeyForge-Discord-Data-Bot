const { fabric } = require('fabric');
const path = require('path');
const Discord = require('discord.js');
const { sortBy, uniq, startCase } = require('lodash');

const main = require('../index');
const { getFlagLang, fetchCard, buildCardList } = require('./fetch');
const { deckIdRegex } = require('../card_data');
const { buildDeckList } = require('./buildDeckList');
const loadImage = (imgPath) => {
    return new Promise(resolve => fabric.Image.fromURL(`file://${path.join(__dirname, imgPath)}`, image => resolve(image)));
};
const [width, height] = [600, 840];

const manualDeckSheet = async (msg, params, flags) => {
    if (0 >= params.length) return;
    params = params.join(' ').split(',');
    const name = startCase(params.pop());
    let cards = [];
    for(const card of params) {
        if (card.replace(/\s["']/g, '').match(deckIdRegex)) {
            cards = cards.map(x => x.replace(/\s/g, ''));
            cards = await buildCardList({ cards: params, set_era_cards: { Legacy: [] } });
            break;
        } else cards.push(fetchCard(card, flags));
    }
    cards = sortBy(cards, ['house', 'card_number']);
    const houses = uniq(cards.map(x => x.house));
    await buildDeckSheet(msg, { name, cards, expansion: 341, houses }, flags);
};

const buildDeckSheet = async (msg, deck, flags) => {
    let language = getFlagLang(flags);
    let cardX = 0, cardY = 0;
    let cardImages = [];
    const canvas = new fabric.StaticCanvas(null, {
        width: 4800,
        height: 4200
    });
    for(const card of deck.cards) {
        let imgPath = `../card_images/${language}/${card.expansion}/${card.card_number}`;
        if (card.expansion === 479) {
            //Dark Amber Vault and its coming
            if (card.card_number === '001' || card.card_number === '117') {
                imgPath += `-${card.house}`;
            }
            //Gigantics
            if (card.card_type === 'Creature1' || card.card_type === 'Creature2') {
                imgPath += '-' + card.card_type.replace(/\D/g, '');
            }
        }
        imgPath += '.png';
        const image = await loadImage(imgPath);
        cardImages.push(image);
    }

    for(const [index, card] of cardImages.entries()) {
        const data = deck.cards[index];
        card.set({ left: cardX, top: cardY });
        canvas.add(card);
        if (data.is_maverick) {
            const maverick = await loadImage('../card_images/cardback/card_mavericks/Maverick.png');
            const mavHouse = await loadImage(`../card_images/cardback/card_mavericks/${data.house}.png`);
            mavHouse.set({ left: cardX, top: cardY });
            maverick.set({ left: cardX, top: cardY });
            canvas.add(mavHouse);
            canvas.add(maverick);
        }

        if (data.is_legacy) {
            const legacy = await loadImage('../card_images/cardback/Legacy.png');
            legacy.scaleToWidth(100);
            legacy.set({ left: cardX + 500, top: 700 + cardY });
            canvas.add(legacy);
        }

        if (data.is_anomaly) {
            const anomHouse = await loadImage(`../card_images/cardback/card_mavericks/${data.house}.png`);
            anomHouse.set({ left: cardX, top: cardY });
            canvas.add(anomHouse);
        }
        if (data.is_enhanced) {
            const enhanced = await loadImage(`../card_images/cardback/enhancements/base-1.png`);

            enhanced.scaleToHeight(90).set({ left: cardX + 32, top: cardY + 120 + (data.amber * 70) });
            canvas.add(enhanced);
        }
        if (4200 > cardX) {
            cardX += width;
        } else {
            cardX = 0;
            cardY += height;
        }
    }
    const decklist = await buildDeckList(deck);
    const deckListImage = new fabric.Image(decklist.getElement());
    deckListImage.set({ left: cardX, top: cardY });
    canvas.add(deckListImage);
    canvas.renderAll();
    const attachment = new Discord.MessageAttachment(canvas.createJPEGStream(), deck.id + '.jpg');
    main.sendMessage(msg, '', attachment);
};

module.exports = manualDeckSheet;
