const main = require('../index');
const Discord = require('discord.js');
const { toUpper } = require('lodash');
const { format, fetchTiming } = require('./fetch');
const { rules } = require('../card_data');

const timingChart = async (msg, params) => {
    const data = fetchTiming(params.join(' '));
    const embed = new Discord.MessageEmbed()
        .setColor('800000')
        .setFooter(`Data pulled from Official rules v${rules.version} ${rules.date}`)
        .setURL(rules.url);
    if(data && params.length > 0) {
        embed.setTitle(toUpper(data.phase))
            .setDescription(format(data.steps));
    } else {
        embed.setTitle('TIMING CHART')
            .addField('Start of Turn', '*» START OF TURN EFFECTS TRIGGER.*')
            .addField('1) FORGE A KEY', '1. Check to see if you are able to forge a key.\n2. If able, spend Æmber equal to the current forging cost and forge a key. If you forge your 3rd key, you immediately win the game.\n*» AFTER A KEY IS FORGED EFFECTS TRIGGER*')
            .addField('2) CHOOSE A HOUSE', '1. Choose which house will be the active house for this turn.\n*» AFTER YOU CHOOSE A HOUSE EFFECTS TRIGGER.*\n2. You may take all the cards from your archives and put them in your hand.')
            .addField('3) PLAY, DISCARD, OR USE CARDS', 'You may perform these actions in any order and repeat them any number of times.')
            .addField('PLAY A CARD.', '1. If your card is a creature, artifact or upgrade, put it into play. If your card is an action, reveal it (after you play it, discard it).\n2. Resolve each Bonus Icon on your card, one at a time.\n*» PLAY: EFFECTS AND AFTER PLAY/ENTERS PLAY EFFECTS TRIGGER.*')
            .addField('USE A CREATURE TO FIGHT.', '1. Exhaust the attacking creature and choose the creature they are fighting.\n*» BEFORE FIGHT, HAZARDOUS X, AND ASSAULT X TRIGGER.*\n2. Creatures deal their damage to each other simultaneously.\n*» FIGHT: EFFECTS, AFTER A CREATURE FIGHTS EFFECTS, AND AFTER A CREATURE IS USED EFFECTS TRIGGER.*')
            .addField('USE A CREATURE TO REAP.', '1. Exhaust the reaping creature.\n2. Gain 1 Æmber.\n*» REAP: EFFECTS, AFTER A CREATURE REAPS EFFECTS, AND *AFTER A CREATURE IS USED& EFFECTS TRIGGER.*')
            .addField('USE AN ACTION OR OMNI ABILITY.', '1. Exhaust your creature or artifact with the Action: or Omni: ability.\n2. Resolve the effects of that ability.\n*» AFTER A CREATURE IS USED EFFECTS TRIGGER.*')
            .addField('4) READY CARDS', '1. Ready each of your exhausted cards')
            .addField('5) DRAW CARDS', '1. Draw cards until you have six or more in your hand (adjusting for chains or card effects).')
            .addField('End of Turn', '*» “END OF TURN” EFFECTS TRIGGER.*');
    }
    main.sendMessage(msg, { embed });
};

exports.timingChart = timingChart;





