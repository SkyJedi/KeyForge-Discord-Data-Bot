const main = require('../index');
const Discord = require('discord.js');
const fetchDeck = require('./fetch').fetchDeck;
const fetchDeckBasic = require('./fetch').fetchDeckBasic;
const fetchDeckADHD = require('./fetch').fetchDeckADHD;
const fetchDoK = require('./fetch').fetchDoK;
const emoji = require('./emoji').emoji;
const sets = {341: 'CotA', 435: 'AoA'};

const deck = async (msg, params) => {
	let deck, del;

	if (params.length === 1 && params[0].length === 36) {
		deck = await fetchDeckBasic(params[0]);
		del = true;
	}
	else deck = await fetchDeck(params.join('+'));

	const embed = new Discord.RichEmbed();
	if (deck) {
		const deckADHD = fetchDeckADHD(deck.id), dokStats = fetchDoK(deck.id);
		Promise.all([deckADHD, dokStats]).then(([deckADHD, dokStats]) => {
			const houses = deck._links.houses.map(house => emoji(house.toLowerCase())).join(' **•** '),
				power = ` **•** ${deck.power_level} ${emoji('power')} **•** ${deck.chains} ${emoji('chains')} **•** ${deck.wins}W/${deck.losses}L`,
				cardStats = getCardStats(deck.cards, deck.expansion),
				cardTypes = Object.keys(cardStats.card_type).map(type => `${type}: ${cardStats.card_type[type]}`).join(' **•** '),
				mavericks = `${emoji('maverick')}: ${cardStats.is_maverick}`,
				legacy = `${emoji('legacy')}: ${cardStats.legacy}`,
				rarity = Object.keys(cardStats.rarity).map(type => `${emoji(type.toLowerCase())}: ${cardStats.rarity[type]}`).join(', '),
				links = `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) **•** [Decks of KeyForge](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [KeyForge Compendium](https://keyforge-compendium.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [Burger Tokens](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${deck.id}&powered_by=archonMatrixDiscord)`;

			embed.setColor('178110')
				.setTitle(` ${deck.name} • ${sets[deck.expansion]}`)
				.addField(houses + power, rarity + ', ' + mavericks + legacy)
				.addField(cardTypes, dokStats.sas)
				.addField(dokStats.deckAERC, deckADHD)
				.addField("Links", links)
				//.setImage(`https://keyforge-compendium.com/decks/${deck.id}/image.png`)
				.setFooter(`Data fetch ${new Date()} • Posted by: @${msg.author.username}`);
			main.sendMessage(msg, {embed}, null, del);
		}).catch(console.error);
	} else main.sendMessage(msg, embed.setColor('FF0000').setDescription(`Deck - ${params.join(' ')}: not found!`));
};

const getCardStats = (cards, expansion) => {
	return {
		card_type: cards.reduce((acc, card) => ({...acc, [card.card_type]: acc[card.card_type] + 1}),
			{Action: 0, Artifact: 0, Creature: 0, Upgrade: 0}
		),
		rarity: cards.reduce((acc, card) =>
			({...acc, [rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1: 1}), {}),
		is_maverick: cards.filter(card => card.is_maverick).length,
		legacy: cards.filter(card => !(card.expansion === expansion)).length
	};
};

const rarityFix = rarity => rarity === 'FIXED' || rarity === 'Variant' ? 'Special': rarity;

exports.deck = deck;