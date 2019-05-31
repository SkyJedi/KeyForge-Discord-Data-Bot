const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
const handlers = require('./handlers');

client.login(config.token).catch(error => console.error(error));

// Register our event handlers (defined below):
client.on('message', msg => handlers.onMessage(msg, client));
client.on('ready', () => handlers.onReady(client));

const sendMessage = (message, text, attachment, del) => {
	message.channel.send(text, attachment && attachment).catch(console.error);
	if (del) message.delete()
};

exports.sendMessage = sendMessage;