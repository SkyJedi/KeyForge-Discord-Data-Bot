const main = require('../index');
const Discord = require('discord.js');
const prefix = require('../config').prefix;

const help = (msg, params) => {
	const embed = new Discord.RichEmbed()
		.setTitle('Help')
		.setColor('2D7C2F');
	switch (params[0]) {
		case 'adhd':
		case 'abce':
			embed
				.addField('A: Æmber', 'An approximation of how much Æmber your deck will generate with minimal piloting. Many cards can create more Æmber than this projects, but few will do less. Decks with Higher Æmber rankings are decks with more Æmber on play cards, more reap abilities, more stealing, and in general better Æmber production.')
				.addField('B: Board', 'Represents your decks ability to control the board. It is influenced by your creature count, ability to damage enemy creatures, ability to clear the board, and ability to destroy artifacts.')
				.addField('C: Æmber Control', 'Ability to control your opponents Æmber supply, either through stealing, capturing, or destroying their Æmber.')
				.addField('E: Efficiency', 'Looser metric that applies to card effects that will allow you to play or use more cards in a turn. Archiving your cards, drawing cards, and activating cards from other factions all play in. It also covers effects that limit your opponents ability to play cards.')
				.addField('More Info', '[KeyForge Compendium](https://keyforge-compendium.com/?powered_by=archonMatrixDiscord)');

			break;
		case 'aerc':
			embed
				.addField('A: Æmber Control', 'Æmber control represents the amount of aember the deck can deny your opponent for forging keys. Lost and stolen aember is counted at a 1:1 ratio, while captured aember and increased key cost is counted at a 2:1 ratio, as those can be reclaimed or avoided.')
				.addField('E: Expected Æmber', 'This rating is an approximation of how much aember you can expect a card to generate. It does not take the ability of creatures to reap into account, unless they are a special skill that will usually generate extra aember, like Dew Faerie\'s "Reap: Gain 1 Æmber Some cards that are difficult to play have their base aember reduced, and some cards that immediately allow the use of creatures have aember added on the assumption creatures will be used to reap.')
				.addField('R: Artifact Control', 'Artifact control is increased by cards that destroy enemy artifacts, or deny your opponent the use of them. 1 point is approximately equal to destroying one artifact.')
				.addField('C: Creature Control', 'Creature control is increased by cards that directly damage, destroy, disable or prevent the play of enemy creatures. It does not account for your creatures\' power, although it does account for special abilities that encourage using a creature to fight. 1 point is approximately equal to destroying one 3 power creature or stunning 2 creatures.')
				.addField('More Info', '[Decks of KeyForge](https://decksofkeyforge.com/about?powered_by=archonMatrixDiscord)');
			break;
		case 'sas':
			embed
				.addField('Card Ratings', 'Every card in the game is given a rating between 0 and 4, where 0 is very bad, and 4 is very good. These create the deck\'s Card Rating.')
				.addField('Card Synergies', 'Every card is given a list of traits it provides, and synergies and antisynergies it has with card and deck traits. Synergies and antisynergies are rated from 1 to 3, with more powerful effects rated higher. A synergy or antisynergy becomes stronger the more instances of its trait that exist in a deck, up to a maximum of 4')
				.addField('Deck and House Synergies', 'The app calculates statistics for all decks, like how many creatures are usually in a deck, or whether the creatures are high or low power. Some cards synergize with the traits of a deck, or a house in a deck.')
				.addField('More Info', '[Decks of KeyForge](https://decksofkeyforge.com/about?powered_by=archonMatrixDiscord)');
			break;
		default:
			embed.addField(`${prefix}card cardName/card# (-en/-es/-it/-de/-fr/-pl/-pt/-zh)`, 'Searches and displays Card. Add -lang tag to specify language.')
				.addField(`${prefix}deck deckName`, 'Searches and displays Deck.')
				.addField(`${prefix}errata`, 'Shows all the cards that have been errata\'ed')
				.addField(`${prefix}randomhand deckName`, 'Draws 6 Random cards from selected deck.')
				.addField(`${prefix}sealed X`, 'Pull X random decks.  (max 5)')
				.addField(`${prefix}rule ruleName`, 'Searches and displays Rule.')
				.addField(`${prefix}invite`, 'Get the invite link.')
				.addField(`${prefix}version`, 'Get the version number of current bot.')
				.addField(`${prefix}faq cardName searchTerm`, 'Get any FAQ of the specified card containing specific term.')
				.addField(`[card name 1] [card name 2] (-en/-es/-it/-de/-fr)`, 'Searches and displays card as an single image (up to 5) [] required. Add -lang tag to specify language.')
				.addField('Bot Information', '[SkyJedi\'s Bot Emporium](https://discord.gg/G8au6FH)')
				.addField('Other Info', ' [KeyForge Discord Server](https://discordapp.com/invite/PcTGhr9) \n[KeyForge](https://www.fantasyflightgames.com/en/products/keyforge/?powered_by=archonMatrixDiscord) by Fantasy Flight Game');
			break;
	}
	main.sendMessage(msg, {embed});
};

exports.help = help;