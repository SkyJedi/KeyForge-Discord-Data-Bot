const main = require('../index');
const Discord = require('discord.js');
const { sum } = require('lodash');

const stats = async ({ message, client }) => {
    let stats = `Currently there are ${client.shard.count} shards.\n`;
    const results = await client.shard.broadcastEval('this.guilds.cache.size')
    stats += `Currently on ${results.reduce((prev, val) => prev + val, 0)} servers.\n`

    const list = await client.shard.broadcastEval(`(${buildMemberList}).call(this)`)

    stats += `Currently assisting ${sum(list)} users.`;

    const embed = new Discord.MessageEmbed()
        .setTitle(`${client.user.username} Stats`)
        .setColor('FFFF00')
        .setDescription(stats);
    await main.sendMessage({ message, embed });
};

const buildMemberList = () => {
    let users = 0;
    this.guilds.cache.forEach(guild => users += +guild.memberCount);
    return users;
};

module.exports = stats;
