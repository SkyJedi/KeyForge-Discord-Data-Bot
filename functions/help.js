const main = require('../index');
const Discord = require('discord.js');
const prefix = require('../config').prefix;

const help = ({msg, params}) => {
	const embed = new Discord.MessageEmbed()
		.setTitle('Help')
		.setColor('2D7C2F');
	switch (params[0]) {
		case 'sas':
			embed
				.addField('Card Ratings', 'Every card in the game is given a rating between 0 and 4, where 0 is very bad, and 4 is very good. These create the deck\'s Card Rating.')
				.addField('Card Synergies', 'Every card is given a list of traits it provides, and synergies and antisynergies it has with card and deck traits. Synergies and antisynergies are rated from 1 to 3, with more powerful effects rated higher. A synergy or antisynergy becomes stronger the more instances of its trait that exist in a deck, up to a maximum of 4')
				.addField('Deck and House Synergies', 'The app calculates statistics for all decks, like how many creatures are usually in a deck, or whether the creatures are high or low power. Some cards synergize with the traits of a deck, or a house in a deck.')
				.addField('More Info', '[Decks of KeyForge](https://decksofkeyforge.com/about?powered_by=archonMatrixDiscord)');
			break;
		default:
			embed.addField(`${prefix}card cardName/card# (-en/-es/-it/-de/-fr/-ko/-pl/-pt/-ru/-th/-zh)`,
				'Searches and displays Card. Add -lang tag to specify language.').
				addField(`${prefix}deck deckName`, 'Searches and displays Deck.').
				addField(`${prefix}errata`, 'Shows all the cards that have been errata\'ed').
				addField(`${prefix}faq searchTerm`, 'Get any FAQ containing specific term.').
				addField(`${prefix}invite`, 'Get the invite link.').
				addField(`${prefix}randomhand deckName -X`, 'Draws X Random cards from selected deck. (max 8, defaults to 6').
				addField(`${prefix}randomcard -X -set`, 'Draws X Random cards from -set (max 8, defaults to 1 and all sets)').
				addField(`${prefix}rule ruleName`, 'Searches and displays Rule.').
				addField(`${prefix}sealed -X -set`, 'Pull X random decks from Y set.  (max 10, defaults 2 and any set)').
				addField(`${prefix}timing searchTerm`, 'Get any the timing Chart containing specific term.').
				addField(`${prefix}text searchTerm (-en/-es/-it/-de/-fr/-pl/-pt/-th/-zh) (-cota/-aoa/-wc)`,
					'Searches and displays a list of cards with the specified text from the card text.')
				.addField(`${prefix}trait searchTerm (-en/-es/-it/-de/-fr/-pl/-pt/-th/-zh) (-cota/-aoa/-wc)`, 'Searches and displays a list of cards with the specified trait/traits.')
				.addField(`${prefix}version`, 'Get the version number of current bot.')
				.addField(`${prefix}poly`, 'rolls any combination of polyhedral dice.')
				.addField(`[card name 1] [card name 2] (-en/-es/-it/-de/-fr/-pl/-pt/-th/-zh)`, 'Searches and displays card as an single image (up to 5) [] required. Add -lang tag to specify language.')
				.addField(`{deck name 1 / decklink} {deck name 2 / decklink} (-en/-es/-it/-de/-fr/-pl/-pt/-th/-zh)`, 'Searches and displays decklists as an single image (up to 3) {} required. Add -lang tag to specify language.')
				.addField('Bot Information', '[SkyJedi\'s Bot Emporium](https://discord.gg/G8au6FH)')
				.addField('Support SkyJedi', '[SkyJedi\'s Patreon](https://www.patreon.com/SkyJedi)')
				.addField('Other Info', ' [KeyForge Discord Server](https://discordapp.com/invite/PcTGhr9) \n[KeyForge](https://www.fantasyflightgames.com/en/products/keyforge/?powered_by=archonMatrixDiscord) by Fantasy Flight Game');
			break;
	}
	main.sendMessage(msg, {embed});
};

module.exports = help;
