const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
const handlers = require('./handlers');
const { adminID } = require('./config');

client.login(config.token).catch(error => console.error(error));

// Register our event handlers (defined below):
client.on('message', message => handlers.onMessage({ message, client }));
client.on('messageReactionAdd', (messageReaction, user) => handlers.onMessageReaction({ messageReaction, user }));
client.on('messageReactionRemove', (messageReaction, user) => handlers.onMessageReaction({ messageReaction, user }));

const sendMessage = ({ message, embed, text = '', attachment }) => {
    if (message.author.id === adminID) {
        text = 'Yes, M\'lord.\n' + text;
    }

    message.channel.send({ embed, content: text, files: attachment ? [attachment] : []}).catch(console.error);
};

exports.sendMessage = sendMessage;
