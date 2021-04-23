const main = require('../index');
const Discord = require('discord.js');
const { sum } = require('lodash');

const stats = async ({ message, client }) => {
    let stats = `Currently there are ${client.shard.count} shards.\n`;
    await client.shard.broadcastEval('this.guilds.cache.size')
        .then(results => stats += `Currently on ${results.reduce((prev, val) => prev + val, 0)} servers.\n`)
        .catch(console.error);
    await client.shard.broadcastEval(`(${buildMemberList}).call(this)`)
        .then(list => stats += `Currently assisting ${sum(list)} users.`).catch(console.error);
    const embed = new Discord.MessageEmbed()
        .setTitle(`${client.user.username} Stats`)
        .setColor('FFFF00')
        .setDescription(stats);
    main.sendMessage(message, { embed });
};

const buildMemberList = () => {
    let users = 0;
    this.guilds.cache.forEach(guild => users += +guild.memberCount);
    return users;
};

module.exports = stats;
