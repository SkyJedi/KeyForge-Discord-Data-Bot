const main = require('../index');
const Discord = require('discord.js');

const patreon = (msg) => {
	const embed = new Discord.MessageEmbed()
		.setColor('7BFE86')
		.setTitle(`**SkyJedi's Patreon**`)
		.setDescription(`Click [here](https://www.patreon.com/SkyJedi) find out how you can support this and other projects!`);
	main.sendMessage(msg, {embed});
};

exports.patreon = patreon;
