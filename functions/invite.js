const main = require('../index');
const Discord = require('discord.js');

const invite = (msg, params, client) => {
	const embed = new Discord.RichEmbed()
		.setColor('777777')
		.setTitle(`**Invite**`)
		.setDescription(`Click [here](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=280576) to invite the bot to your server!`);
	main.sendMessage(msg, {embed});
};

exports.invite = invite;