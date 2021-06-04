const knownCommands = require('./functions/index');
const { prefix: commandPrefix, Patreon } = require('./config');
const main = require('./index');

const { dropWhile, get } = require('lodash');

// Called every time a message comes in:
const onMessage = async ({ message, client }) => {
    if (message.author.bot) return; // Ignore messages from the bot
    if (message.content.includes('`')) return; // Ignore messages that contain `

    //check to see if bot can send messages on channel and external emoji can be used;
    if (message.channel.type !== 'dm') {
        if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;
        if (!message.channel.permissionsFor(client.user).has('USE_EXTERNAL_EMOJIS')) {
            main.sendMessage({
                message,
                text: `Please enable \'Use External Emoji\' permission for ${client.user.username}`
            });
            return;
        }
        if (!message.channel.permissionsFor(client.user).has('EMBED_LINKS')) {
            main.sendMessage({
                message,
                text: `Please enable \'Embed Links\' permission for ${client.user.username}`
            });
            return;
        }
    }

    let params = message.content.toLowerCase().split(' '),
        commandName = params.map(a => a.startsWith(commandPrefix) && a).filter(Boolean).join().slice(1),
        flags = params.filter(a => a.startsWith('-')).map(flag => flag.slice(1)),
        types = {
            brackets: /\[(.*?)]/,
            d: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
            deck: /{(.*?)}/
        };

    if (commandName) {
        params = dropWhile(params, a => !a.includes(commandPrefix)).slice(1).filter(a => !a.startsWith('-'));
    } else {
        Object.keys(types).forEach(a => {
            let string = message.content.toLowerCase(), arr = [];
            do {
                let param = string.match(types[a]);
                if (param) {
                    arr.push(get(param, '1', param[0]));
                    string = string.replace(get(param, '0'), '');
                }
            } while (string.match(types[a]));
            if (arr.length > 0) {
                commandName = a;
                if (params < 1) flags = [...flags, 'delete'];
                params = arr;
            }
            if ((commandName === 'd' || commandName === 'deck') && params.length > 1) {
                commandName = 'multiDeck';
                params = params.slice(0, 3);
            }
        });
    }

    if (!commandName) return;
    params = params.filter(Boolean);

    switch (commandName) {
        case 'c':
        case 'card':
            commandName = 'cards';
            params = [params.join(' ')];
            break;
        case 'brackets':
            commandName = 'cards';
            break;
        case 'd':
            commandName = 'deck';
            params = [params.join(' ')];
            break;
        case 'decksheet':
        case 'ds':
            commandName = 'deckSheet';
            break;
        case 'manualdecksheet':
        case 'mds':
            commandName = 'manualDeckSheet';
            break;
        case 'f':
            commandName = 'faq';
            break;
        case 'r':
            commandName = 'rule';
            break;
        case 'v':
        case 'ver':
            commandName = 'version';
            break;
        case 'rh':
        case 'randomhand':
            commandName = 'randomHand';
            break;
        case 'rc':
        case 'randomcard':
            commandName = 'randomCard';
            break;
        case 'randomdeck':
            commandName = 'randomDeck';
            break;
        case 'time':
        case 'timing':
        case 'chart':
        case 'timingchart':
            commandName = 'timingChart';
            break;
        default:
            break;
    }

    // If the command is known, let's execute it:
    if (commandName in knownCommands) {
        console.info(`${message.author.username}, ${commandName}, ${params}, ${flags}, ${new Date()}`);
        knownCommands[commandName]({ message, params, flags, client });
    }

};

const onMessageReaction = ({ messageReaction, user }) => {
    if (messageReaction.message.id !== Patreon.message) return;
    console.info(user.username, messageReaction.emoji.name);
};

module.exports = {
    onMessage,
    onMessageReaction
};
