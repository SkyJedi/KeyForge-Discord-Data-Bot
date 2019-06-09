const main = require('../index');
const Discord = require('discord.js');
const _ = require('lodash');

const stats = async (msg, params, flags, client) => {
	let stats = `Currently there are ${client.shard.count} shards.\n`;
	await client.shard.broadcastEval('this.guilds.size')
		.then(results => stats += `Currently on ${results.reduce((prev, val) => prev + val, 0)} servers.\n`).catch(console.error);
	await client.shard.broadcastEval(`(${buildMemberList}).call(this)`)
		.then(list => stats += `Currently assisting ${_.sum(list)} users.`).catch(console.error);
	const embed = new Discord.RichEmbed()
		.setTitle(`${client.user.username} Stats`)
		.setColor('FFFF00')
		.setDescription(stats);
	main.sendMessage(msg, {embed});
};

const buildMemberList = () => {
	let users = 0;
	this.guilds.forEach(guild => users += +guild.memberCount);
	return users;
};

exports.stats = stats;