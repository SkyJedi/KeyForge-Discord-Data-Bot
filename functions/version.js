const main = require('../index');
const versionNumber = require('../package').version;
const Discord = require('discord.js');

const version = (msg) => {
	const embed = new Discord.MessageEmbed()
		.setColor('777777')
		.setDescription(`**Version:** ${versionNumber}`);
	main.sendMessage(msg, {embed});
};

module.exports = version;
