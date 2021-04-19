const { fabric } = require('fabric');
const Discord = require('discord.js');

const main = require('../index');
const { sortBy } = require('lodash');
const { getFlagLang, fetchDeck, buildEnhancements, loadImage } = require('./fetch');
const buildDeckList = require('./buildDeckList');
const { sets } = require('../card_data');

const [width, height] = [600, 840];

const deckSheet = async ({ msg, params, flags }) => {
    if (0 >= params.length) return;
    let deck;
    try {
        deck = await fetchDeck(params);
    } catch (err) {
        return;
    }
    deck = deck[0];
    deck.cards = deck.cards.map(x => ({ ...x, is_non_deck: !!x.is_non_deck }));
    deck.cards = sortBy(deck.cards, ['is_non_deck', 'house']);
    deck.enhancements = await buildEnhancements(deck);
    await buildDeckSheet(msg, deck, flags);
};

const buildDeckSheet = async (msg, deck, flags) => {
    let language = getFlagLang(flags);
    deck = { language, ...deck };
    let cardX = 0, cardY = 0;
    let cards = [];
    const canvas = new fabric.StaticCanvas(null, {
        width: 4800,
        height: 4200
    });
    for (const card of deck.cards) {
        const set = sets.find(x => x.set_number === card.expansion);
        if (!set.languages.includes(language)) {
            language = 'en';
        }
        let imgPath = `${language}/${card.expansion}/${card.card_number}`;
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
        cards.push(image);
    }

    for (const [index, card] of cards.entries()) {
        const data = deck.cards[index];
        card.set({ left: cardX, top: cardY });
        canvas.add(card);
        if (data.is_maverick) {
            const maverick = await loadImage('cardback/card_mavericks/Maverick.png');
            const mavHouse = await loadImage(`cardback/card_mavericks/${data.house}.png`);
            mavHouse.set({ left: cardX, top: cardY });
            maverick.set({ left: cardX, top: cardY });
            canvas.add(mavHouse);
            canvas.add(maverick);
        }

        if (data.is_legacy) {
            const legacy = await loadImage('cardback/Legacy.png');
            legacy.scaleToWidth(100);
            legacy.set({ left: cardX + 500, top: 700 + cardY });
            canvas.add(legacy);
        }

        if (data.is_anomaly) {
            const anomHouse = await loadImage(`cardback/card_mavericks/${data.house}.png`);
            anomHouse.set({ left: cardX, top: cardY });
            canvas.add(anomHouse);
        }
        if (data.is_enhanced) {
            const enhanced = await loadImage(`cardback/enhancements/base-1.png`);

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
    const stream = canvas.createJPEGStream();
    stream.on('end', () => canvas.dispose());
    const attachment = new Discord.MessageAttachment(stream, deck.id + '.jpg');
    main.sendMessage(msg, '', attachment);
};

module.exports = deckSheet;
