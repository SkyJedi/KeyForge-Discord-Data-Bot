const main = require('../index');
const Discord = require('discord.js');
const prefix = require('../config').prefix;

const help = (msg, params) => {
	const embed = new Discord.MessageEmbed()
		.setTitle('Help')
		.setColor('2D7C2F');
	switch (params[0]) {
		case 'aerc':
			embed
				.addField('A: Æmber Control', 'Æmber control represents the amount of Æmber the deck can deny your opponent for forging keys. Lost and stolen Æmber is counted at a 1:1 ratio, while captured Æmber and increased key cost is counted at a 2:1 ratio, as those can be reclaimed or avoided.')
				.addField('E: Expected Æmber', `How much Æmber you can expect a card to generate. It does not account for creatures reaping unless they have a special ability like Dew Faerie\'s "Reap: Gain 1<A>".\nSome cards that are difficult to play have their base Æmber reduced, and some cards that immediately allow the use of creatures have Æmber added.`)
				.addField('R: Artifact Control', 'Artifact control is increased by cards that destroy enemy artifacts, or deny your opponent the use of them.\nDestroying an artifact is worth 1.5 points. Using an enemy artifact (destroying single use artifacts) is 1 point. And delaying artifacts is 0.5 points.')
				.addField('C: Creature Control', 'Creature control is increased by cards that damage, destroy, or disable enemy creatures. Special abilities that encourage using a creature to fight contribute extra depending on the ability.\n1 point is approximately equal to dealing 4 damage or stunning 2 creatures.')
				.addField('F: Efficiency', 'Efficiency is increased by effects that allow you to play extra cards. It is reduced by cards that prevent you from playing or drawing cards, like cards that give chains or Bad Penny.\n1 point is approximately equal to drawing two cards or archiving a random card.')
				.addField('D: Disruption', 'Disruption is increased by effects that reduce the number of cards your opponent can play. 1 point is approximately equal to preventing your opponent from drawing 2 cards.')
				.addField('P: Effective Power', 'Effective power represents the real usable power of creatures in a deck. Creatures like Grommid, which often cannot be played or used, have their total power reduced. Meanwhile, other cards contribute extra power, like Blood of Titans or Zyzzix the Many.\nEffective power is also increased by Armor at a 1:1 ratio, and other abilities that affect creature survivability, like elusive, skirmish, hazardous, assault, and healing.\nWhen included in total AERC score, Effective Power is divided by 10.')
				.addField('Aember Protection', 'Aember Protection includes any cards with effects that prevent stealing. This includes obvious cards, like Po\'s Pixies, as well as Key Cheats (can\'t steal what you don\'t have!) and Control the Weak (can\'t steal with cards you can\'t play!)')
				.addField('House Cheating', 'House cheating represents how well a deck can use cards outside of their normal house. For example, Ulyq Megamouth allows you to use a friendly non-mars creature, and increases H. Cards that let you play cards out of house, like Phase Shift, effect efficiency.')
				.addField('Other', 'Other is a catch all for qualities of cards that don\'t fit into the other AERC traits. It includes unusual effects such as viewing an opponent\'s hand.')
				.addField('AERC Score (AERC)', 'To calculate the AERC score divide Effective Power by 10, add all other AERC scores, and then add 0.4 x number of creatures. The AERC score represents how good a deck is at the core mechanics of the game.')
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
			embed.addField(`${prefix}card cardName/card# (-en/-es/-it/-de/-fr/-pl/-pt/-th/-zh)`,
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

exports.help = help;
