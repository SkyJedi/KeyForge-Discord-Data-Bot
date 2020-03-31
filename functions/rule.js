const main = require('../index');
const Discord = require('discord.js');
const { findIndex, upperCase } = require('lodash');
const { format } = require('./fetch');
const { rules } = require('../card_data');

const rule = (msg, params) => {
    let i = findIndex(Object.keys(ruleList), term => term === params.join(' '));
    if(0 > i) i = findIndex(Object.keys(ruleList), term => term.startsWith(params.join(' ')));
    if(0 > i) i = findIndex(Object.keys(ruleList), term => term.includes(params.join(' ')));
    const key = Object.keys(ruleList)[i];
    let embed = new Discord.RichEmbed();

    if(key) {
        embed.setColor('1DE5C7')
            .setTitle(`RULE - ${upperCase(key)}`)
            .setDescription(format(ruleList[key]))
            .setFooter(`Data pulled from Official rules v${rules.version} ${rules.date}`)
            .setURL(rules.url);
        main.sendMessage(msg, { embed });
    }
};

exports.rule = rule;