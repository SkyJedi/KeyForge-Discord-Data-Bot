const main = require('../index');
const Discord = require('discord.js');
const {toUpper} = require('lodash');
const timingChart = async (msg, params) => {
	const step = timing.find(x => params.every(y => x.phase.toLowerCase().includes(y.toLowerCase())));
	const embed = new Discord.RichEmbed()
		.setColor('800000')
		.setFooter("Data pulled from Official rules v1.4 Sept, 2019")
		.setURL("https://images-cdn.fantasyflightgames.com/filer_public/88/71/8871df4e-5647-4a22-a8cc-4e6b0a46a15c/keyforge_rulebook_v10-compressed.pdf");
	if (step && params.length > 0) {
		embed.setTitle(toUpper(step.phase))
			.setDescription(format(step.steps));
	} else {
		embed.setTitle('TIMING CHART')
			.addField('1) FORGE A KEY', '*» START OF TURN EFFECTS TRIGGER.*\n1. Check to see if you are able to forge a key.\n2. If able, spend Æmber equal to the current forging cost and forge a key. If you forge your 3rd key, you immediately win the game.\n*» AFTER A KEY IS FORGED EFFECTS TRIGGER*')
			.addField('2) CHOOSE A HOUSE', '1. Choose which house will be the active house for this turn.\n*» AFTER YOU CHOOSE A HOUSE EFFECTS TRIGGER.*\n2. You may take all the cards from your archives and put them in your hand.')
			.addField('3) PLAY, DISCARD, OR USE CARDS', 'You may perform these actions in any order and repeat them any number of times.')
			.addField('PLAY A CARD.', '1. If your card is a creature, artifact or upgrade, put it into play. If your card is an action, reveal it (after you play it, discard it).\n2. Resolve the Æmber bonus on your card.\n*» PLAY: EFFECTS AND AFTER PLAY/ENTERS PLAY EFFECTS TRIGGER.*')
			.addField('USE A CREATURE TO FIGHT.', '1. Exhaust the attacking creature and choose the creature they are fighting.\n*» BEFORE FIGHT, HAZARDOUS X, AND ASSAULT X TRIGGER.*\n2. Creatures deal their damage to each other simultaneously.\n*» FIGHT: EFFECTS, AFTER A CREATURE FIGHTS EFFECTS, AND AFTER A CREATURE IS USED EFFECTS TRIGGER.*')
			.addField('USE A CREATURE TO REAP.', '1. Exhaust the reaping creature.\n2. Gain 1 Æmber.\n*» REAP: EFFECTS, AFTER A CREATURE REAPS EFFECTS, AND *AFTER A CREATURE IS USED& EFFECTS TRIGGER.*')
			.addField('USE AN ACTION OR OMNI ABILITY.', '1. Exhaust your creature or artifact with the Action: or Omni: ability.\n2. Resolve the effects of that ability.\n*» AFTER A CREATURE IS USED EFFECTS TRIGGER.*')
			.addField('4) READY CARDS', '1. Ready each of your exhausted cards')
			.addField('5) DRAW CARDS', '1. Draw cards until you have six or more in your hand (adjusting for chains or card effects).\n*» END OF TURN EFFECTS TRIGGER.*');
	}

	main.sendMessage(msg, {embed});
};

const format = (text) => text.replace(/([a-z\d_-]+):/gi, "**$1:**");

const timing = [
	{
		phase: "forge a key",
		steps: '*» START OF TURN EFFECTS TRIGGER.*\n1. Check to see if you are able to forge a key.\n2. If able, spend Æmber equal to the current forging cost and forge a key. If you forge your 3rd key, you immediately win the game.\n*» AFTER A KEY IS FORGED EFFECTS TRIGGER*'
	},
	{
		phase: 'choose a house',
		steps: '1. Choose which house will be the active house for this turn.\n*» AFTER YOU CHOOSE A HOUSE EFFECTS TRIGGER.*\n2. You may take all the cards from your archives and put them in your hand.'
	},
	{
		phase: 'play, discard, or use card',
		steps: 'You may perform these actions in any order and repeat them any number of times.'
	},
	{
		phase: 'ready cards',
		steps: '1. Ready each of your exhausted cards'
	},
	{
		phase: 'draw cards',
		steps: '1. Draw cards until you have six or more in your hand (adjusting for chains or card effects).\n*» END OF TURN EFFECTS TRIGGER.*'
	},
	{
		phase: 'use a creature to fight',
		steps: '1. Exhaust the attacking creature and choose the creature they are fighting.\n*» BEFORE FIGHT, HAZARDOUS X, AND ASSAULT X TRIGGER.*\n2. Creatures deal their damage to each other simultaneously.\n*» FIGHT: EFFECTS, AFTER A CREATURE FIGHTS EFFECTS, AND AFTER A CREATURE IS USED EFFECTS TRIGGER.*'
	},
	{
		phase: 'use a creature to reap',
		steps: '1. Exhaust the reaping creature.\n2. Gain 1 Æmber.\n*» REAP: EFFECTS, AFTER A CREATURE REAPS EFFECTS, AND *AFTER A CREATURE IS USED& EFFECTS TRIGGER.*'
	},
	{
		phase: 'use an action or omni ability',
		steps: '1. Exhaust your creature or artifact with the Action: or Omni: ability.\n2. Resolve the effects of that ability.\n*» AFTER A CREATURE IS USED EFFECTS TRIGGER.*'
	},
	{
		phase: 'destroyed',
		steps: 'Cards are tagged for destruction.\n*» “DESTROYED” EFFECTS TRIGGER*\n.Each destroyed card is put into its owner’s discard pile. (The battleline immediately shifts to fill in each destroyed creature’s place.)\n*» “AFTER A CREATURE IS DESTROYED” EFFECTS TRIGGER*'
	},
	{
		phase: 'damage',
		steps: 'The following steps occur each time damage is dealt to one or more creatures\n1. Apply effects that prevent damage.\n2. Use armor to prevent damage.\n3. Deal all remaining damage.'
	}
];

exports.timingChart = timingChart;





