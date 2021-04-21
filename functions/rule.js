const main = require('../index');
const Discord = require('discord.js');
const { findIndex, upperCase } = require('lodash');
const { format } = require('./fetch');
const { rules,rulesList } = require('../card_data');

const rule = ({message, params}) => {
    let i = findIndex(Object.keys(rulesList), term => term === params.join(' '));
    if(0 > i) i = findIndex(Object.keys(rulesList), term => term.startsWith(params.join(' ')));
    if(0 > i) i = findIndex(Object.keys(rulesList), term => term.includes(params.join(' ')));
    const key = Object.keys(rulesList)[i];
    let embed = new Discord.MessageEmbed();

    if(key) {
        embed.setColor('1DE5C7')
            .setTitle(`RULE - ${upperCase(key)}`)
            .setDescription(format(rulesList[key]))
            .setFooter(`Data pulled from Official rules ${rules.version} ${rules.date}`)
            .setURL(rules.url);
        main.sendMessage(message, { embed });
    }
};

module.exports = rule;
