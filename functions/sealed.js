const main = require('../index');
const Discord = require('discord.js');
const {get} = require('lodash');
const {getFlagNumber, fetchDeckBasic, fetchRandomDecks} = require('./fetch');
const {sets} = require('../card_data');
const {emoji} = require('./emoji');

const sealed = (msg, params, flags) => {
	const number = getFlagNumber(flags, 2),
		set = get(sets.filter(set => flags.includes(set.set_number)), '[0].flag', false),
		arr = [...Array(+number)];
	const embed = new Discord.RichEmbed().setColor('ffff00'),
		deckIDs = arr.map(() => fetchRandomDecks(set));
	Promise.all(deckIDs).then(ids => {
		const decks = ids.map(id => fetchDeckBasic(id));
		Promise.all(decks).then(decks => {
			const houses = decks.map(deck => deck._links.houses.map(house => emoji(house.toLowerCase())).join(' **•** ')),
				links = decks.map(deck => `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) **•** [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [BT](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${deck.id}&powered_by=archonMatrixDiscord)`);
			arr.forEach((a, index) => {
				embed.addField(`Deck ${index + 1}`, `${decks[index].name} **•** **${sets.find(x => x.set_number === decks[index].expansion).flag}**`)
					.addField(houses[index], links[index]);
			});
			main.sendMessage(msg, {embed});
		});
	});
};

exports.sealed = sealed;