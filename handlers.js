const knownCommands = require('./functions/index');
const commandPrefix = require('./config').prefix;
const version = require('./package').version;
const {dropWhile, get} = require('lodash');

// Called every time a message comes in:
const onMessage = (msg, client) => {
	if (msg.author.bot) return; // Ignore messages from the bot
	let params = msg.content.toLowerCase().split(' '),
		commandName = params.map(a => a.startsWith(commandPrefix) && a).filter(Boolean).join().slice(1),
		flags = params.filter(a => a.startsWith('-')).map(flag => flag.slice(1)),
		types = {
			brackets: /\[(.*?)\]/,
			d: /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/,
			deck: /\{(.*?)\}/,
		};

	if (commandName) {
		params = dropWhile(params, a => !a.includes(commandPrefix))
			.slice(1)
			.filter(a => !a.startsWith('-'));
	} else {
		Object.keys(types).forEach(a => {
			let message = msg.content.toLowerCase(), arr = [];
			do {
				let param = message.match(types[a]);
				if (param) {
					arr.push(get(param, '1', param[0]));
					message = message.replace(get(param, '0'), '');
				}
			} while (message.match(types[a]));
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
		case 'random':
		case 'randomcard':
			commandName = 'randomCard';
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
		console.log(`${msg.author.username}, ${commandName}, ${params}, ${flags}, ${new Date()}`);
		knownCommands[commandName](msg, params, flags, client);
	}

};

// Called every time the bot connects to Twitch chat:
const onReady = client => {
	console.log(`Logged in as ${client.user.username}!`);
	console.log(`Version: ${version}`);
};

exports.onMessage = onMessage;
exports.onReady = onReady;
