const main = require('../index');
const Discord = require('discord.js');
const fetchDeck = require('./fetch').fetchDeck;
const fetchDeckADHD = require('./fetch').fetchDeckADHD;
const fetchDoK = require('./fetch').fetchDoK;
const emoji = require('./emoji').emoji;
const sets = {341: 'CotA', 435: 'AoA'};

const deck = async (msg, params) => {
	const [deck, cards] = await fetchDeck(params.join('+'));
	const embed = new Discord.RichEmbed();
	if (deck) {
		const deckADHD = fetchDeckADHD(deck.id), dokStats = fetchDoK(deck.id);
		Promise.all([deckADHD, dokStats]).then(([deckADHD, dokStats]) => {
			const houses = deck._links.houses.map(house => emoji(house.toLowerCase())).join(' **•** '),
				power = ` **•** ${deck.power_level} ${emoji('power')} **•** ${deck.chains} ${emoji('chains')} **•** ${deck.wins}W/${deck.losses}L`,
				cardStats = getCardStats(cards),
				cardTypes = Object.keys(cardStats.card_type).map(type => `${type}: ${cardStats.card_type[type]}`).join(' **•** '),
				mavericks = `${emoji('maverick')}: ${cardStats.is_maverick}`,
				rarity = Object.keys(cardStats.rarity).map(type => `${emoji(type.toLowerCase())}: ${cardStats.rarity[type]}`).join(', '),
				links = `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) **•** [KeyForge Compendium](https://keyforge-compendium.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [Burger Tokens](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${deck.id}&powered_by=archonMatrixDiscord) **•** [Decks of KeyForge](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`;

			embed.setColor('178110')
				.setTitle(`${deck.name} • ${sets[deck.expansion]}`)
				.addField(houses + power, rarity + ', ' + mavericks)
				.addField(cardTypes, deckADHD)
				.addField(dokStats.sas, dokStats.deckAERC)
				.addField("Links", links)
				.setFooter(`Data fetch ${new Date()}`)
				.setImage(`https://keyforge-compendium.com/decks/${deck.id}/image.png`);
			main.sendMessage(msg, {embed});
		}).catch(console.error);
	} else main.sendMessage(msg, embed.setColor('FF0000').setDescription(`Deck - ${params.join(' ')}: not found!`));
};

const getCardStats = (cards) => {
	return {
		card_type: cards.reduce((acc, card) => ({...acc, [card.card_type]: acc[card.card_type] + 1}),
			{Action: 0, Artifact: 0, Creature: 0, Upgrade: 0}
		),
		rarity: cards.reduce((acc, card) => ({...acc, [card.rarity]: acc[card.rarity] + 1}),
			{Common: 0, Uncommon: 0, Rare: 0, Special: 0}
		),
		is_maverick: cards.filter(card => card.is_maverick).length,
	};
};

exports.deck = deck;