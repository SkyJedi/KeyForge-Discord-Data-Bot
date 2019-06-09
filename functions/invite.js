const main = require('../index');
const Discord = require('discord.js');

const invite = (msg, params, flags, client) => {
	const embed = new Discord.RichEmbed()
		.setColor('777777')
		.setTitle(`**Invite**`)
		.setDescription(`Click [here](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=288832) to invite the bot to your server!`);
	main.sendMessage(msg, {embed});
};

exports.invite = invite;