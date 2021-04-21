const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
const handlers = require('./handlers');
const {adminID} = require('./config');

client.login(config.token).catch(error => console.error(error));

// Register our event handlers (defined below):
client.on('message', message => handlers.onMessage({ message, client }));
client.on('ready', () => handlers.onReady(client));

const sendMessage = (message, text, attachment, flags = []) => {
	if (message.author.id === adminID) {
		message.channel.send('Yes, M\'lord.');
	}
	message.channel.send(text, attachment && attachment).catch(console.error);
	if (flags.includes('delete')) message.delete();
};

exports.sendMessage = sendMessage;
