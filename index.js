const Discord = require('discord.js');
const { Patreon, token } = require('./config');
const handlers = require('./handlers');
const { adminID } = require('./config');

const ClientOptions = {
    messageCacheMaxSize: 10,
    messageCacheLifetime: 30,
    messageSweepInterval: 60
};
const client = new Discord.Client(ClientOptions);

client.login(token).catch(error => console.error(error));

// Register our event handlers (defined below):
client.on('message', message => handlers.onMessage({ message, client }));
//client.on('messageReactionAdd', (messageReaction, user) => handlers.onMessageReaction({ messageReaction, user }));
//client.on('messageReactionRemove', (messageReaction, user) => handlers.onMessageReaction({ messageReaction, user }));

const sendMessage = async ({ message, embed, text = '', attachment }) => {
    const array = await client.shard.broadcastEval(`(${checkRoles}).call(this, '${message.author.id}', '${Patreon.guild}', '${Patreon.role}')`);

    console.log(array)
    if (message.author.id === adminID) {
        text = 'Yes, M\'Lord.\n' + text;
    } else if (array.some(x => x)) {
        let content, reactions;
        let data = await client.shard.broadcastEval(`(${loadReactions}).call(this, '${Patreon.channel}', '${Patreon.message}')`);
        [content, reactions] = data.find(x => x);
        let reaction = reactions.find(reaction => reaction.users.includes(message.author.id) && content.includes(reaction.emoji.name));
        if (reaction) {
            let title = content.split('\n')
                .find(line => line.includes(reaction.emoji.name))
                .replace(/\*(.*?)\*/g, '')
                .trim();
            text = `Yes, ${title}.\n` + text;
        }
    }

    message.channel.send({ embed, content: text, files: attachment ? [attachment] : [] }).catch(console.error);
};

const loadReactions = async (PatreonChannel, PatreonMessage) => {
    const channel = await this.channels.fetch(PatreonChannel);
    if (channel) {
        const reactions = [];
        const message = await channel.messages.fetch(PatreonMessage);
        for (const [_, reaction] of message.reactions.cache) {
            const userList = await reaction.users.fetch();
            let users = [];
            for (const [_, user] of userList.entries()) {
                users.push(user.id);
            }
            reactions.push({ users, emoji: reaction.emoji });
        }

        return [message.content, reactions];
    }
};

const checkRoles = async (user, id, roleId) => {
    let guild = await this.guilds.cache.get(id);
    if (!guild) return null;
    let role = guild.roles.fetch(roleId);
    if (!role || !role.members) return null;
    let member = role.members.get(user);

    if (member) return member._roles.some(role => role === roleId);

    return await guild.members.fetch(user)
        .then(member => member._roles.some(role => role === roleId))
        .catch(() => null);

};

exports.sendMessage = sendMessage;
