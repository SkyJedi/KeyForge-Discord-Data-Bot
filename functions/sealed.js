const main = require('../index');
const Discord = require('discord.js');
const { getFlagNumber, getFlagSet, fetchRandomDecks } = require('./fetch');
const { multiDeck } = require('./multiDeck');
const { sets } = require('../card_data');
const { emoji } = require('./emoji');

const sealed = (msg, params, flags) => {
	const number = Math.min(10, getFlagNumber(flags, 2));
	const set = getFlagSet(flags);
	let arr = [...Array(+number)];

	if(flags.includes('rainbow')) {
		arr = [341, 435, 452];
	} else arr = arr.fill(set);

	const embed = new Discord.RichEmbed().setColor('ffff00').setTitle('Sealed Decks');
	const decks = arr.map(x => fetchRandomDecks(x)).filter(Boolean);
	Promise.all(decks).then(decks => {
		decks.filter(Boolean).forEach(deck => {
			embed.addField(
				`${deck.name} • ${sets.find(x => x.set_number === deck.expansion).flag}`,
				`${deck._links.houses.map(house => emoji(house.toLowerCase()))
					.join(
						' • ')} • [Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) • [DoK](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord)`);
		});
		main.sendMessage(msg, { embed });
		if(['decks', 'deck', 'decklists', 'dl', 'decklist'].some(x => flags.includes(x))) multiDeck(msg, decks.map(x => x.id), flags);
	});
};

exports.sealed = sealed;