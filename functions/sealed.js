const main = require('../index');
const Discord = require('discord.js');
const fetchDeckBasic = require('./fetch').fetchDeckBasic;
const fetchRandomDecks = require('./fetch').fetchRandomDecks;

const emoji = require('./emoji').emoji;

const sealed = (msg, params) => {
	let arr = [...Array(2)];
	if (params[0]) arr = [...Array(Number.isInteger(+params[0]) ? (+params[0]>5 ? 5: +params[0]) : 2)];
	const embed = new Discord.RichEmbed().setColor('ffff00'),
		deckIDs = arr.map(() => fetchRandomDecks());
	Promise.all(deckIDs).then(ids => {
		const decks = ids.map(id => fetchDeckBasic(id));
		Promise.all(decks).then(decks => {
			const houses = decks.map(deck => deck._links.houses.map(house => emoji(house.toLowerCase())).join(' **•** ')),
				links = decks.map(deck => `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) **•** [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [KFC](https://keyforge-compendium.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [BT](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${deck.id}&powered_by=archonMatrixDiscord)`);
			arr.forEach((a, index) => {
				embed.addField(`Deck ${index + 1}`, decks[index].name)
					.addField(houses[index], links[index])
			});
			main.sendMessage(msg, {embed});
		});
	});
};

exports.sealed = sealed;