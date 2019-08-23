const main = require('../index');
const Discord = require('discord.js');
const {fetchDeck, fetchDeckBasic, fetchDoK} = require('./fetch');
const {emoji} = require('./emoji');
const {sets} = require('../card_data');
const {get} = require('lodash');

const deck = async (msg, params, flags) => {
	let deck;
	if (0 >= params.length) return;
	if (params.length === 1 && params[0].length === 36) deck = await fetchDeckBasic(params[0]);
	else deck = await fetchDeck(params.join('+'));

	const embed = new Discord.RichEmbed();
	if (deck) {
		const dokStats = fetchDoK(deck.id);
		Promise.all([dokStats]).then(([dokStats]) => {
			const houses = deck._links.houses.map(house => emoji(house.toLowerCase())).join(' **•** '),
				power = ` **•** ${deck.power_level} ${emoji('power')} **•** ${deck.chains} ${emoji('chains')} **•** ${deck.wins}W/${deck.losses}L`,
				cardStats = getCardStats(deck.cards, deck.expansion),
				cardTypes = Object.keys(cardStats.card_type).map(type => `${type}: ${cardStats.card_type[type]}`).join(' **•** '),
				mavericks = `${emoji('maverick')}: ${cardStats.is_maverick}`,
				amber = `${emoji('aember')}: ${cardStats.amber}`,
				legacy = `${emoji('legacy')}: ${cardStats.legacy}`,
				rarity = ['Special', 'Rare', 'Uncommon', 'Common'].map(type => {
					if (cardStats.rarity[type]) return `${emoji(type.toLowerCase())}: ${cardStats.rarity[type]}`;
				}).filter(Boolean).join(', '),
				links = `[Official](https://www.keyforgegame.com/deck-details/${deck.id}?powered_by=archonMatrixDiscord) **•** [Decks of KeyForge](https://decksofkeyforge.com/decks/${deck.id}?powered_by=archonMatrixDiscord) **•** [Burger Tokens](https://burgertokens.com/pages/keyforge-deck-analyzer?deck=${deck.id}&powered_by=archonMatrixDiscord)`,
				set = get(sets.filter(set => deck.expansion === set.set_number), '[0].flag', 'ERROR');
			embed.setColor('178110')
				.setTitle(` ${deck.name} • ${set}`)
				.addField(houses + power, cardTypes)
				.addField(amber + ', ' + rarity + ', ' + mavericks + ', ' + legacy, dokStats.sas)
				.addField(dokStats.deckAERC, links)
				.setFooter(`Posted by: @${msg.member.nickname ? msg.member.nickname : msg.author.username}`);
			main.sendMessage(msg, {embed}, null, flags);
		}).catch(console.error);
	} else main.sendMessage(msg, embed.setColor('FF0000').setDescription(`Deck - ${params.join(' ')}: not found!`));
};

const getCardStats = (cards, expansion) => {
	return {
		amber: cards.reduce((acc, card) => acc + card.amber, 0),
		card_type: cards.reduce((acc, card) => ({...acc, [card.card_type]: acc[card.card_type] + 1}),
			{Action: 0, Artifact: 0, Creature: 0, Upgrade: 0}
		),
		rarity: cards.reduce((acc, card) =>
			({
				...acc,
				[rarityFix(card.rarity)]: acc[rarityFix(card.rarity)] ? acc[rarityFix(card.rarity)] + 1 : 1
			}), {}),
		is_maverick: cards.filter(card => card.is_maverick).length,
		legacy: cards.filter(card => !(card.expansion === expansion)).length
	};
};

const rarityFix = rarity => rarity === 'FIXED' || rarity === 'Variant' ? 'Special' : rarity;

exports.deck = deck;