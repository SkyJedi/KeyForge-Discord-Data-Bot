const knownCommands = require('./functions/index');
const commandPrefix = require('./config').prefix;
const version = require('./package').version;
const _ = require('lodash');


// Called every time a message comes in:
const onMessage = (msg, client) => {
	if (msg.author.bot) return; // Ignore messages from the bot
	let params = msg.content.split(' '),
		commandName = params.map(a => a.startsWith(commandPrefix) && a).filter(Boolean).join().slice(1),
		flags = params.filter(a => a.startsWith('-')).map(flag => flag.slice(1)),
		types = {
			brackets: {
				regex: /\[(.*?)\]/,
				params: []
			},
			d: {
				regex: /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/,
				params: []
			},
			deck: {
				regex: /\{(.*?)\}/,
				params: []
			},
		};
	if (commandName) {
		if (msg.content.startsWith(commandPrefix)) params = msg.content.substr(1).split(' ');
		else params = msg.content.split(commandPrefix)[1].split(' ');
		params = params.splice(1).filter(a => !a.startsWith('-'));
	}

	Object.keys(types).forEach(a => {
		let message = msg.content;
		do {
			let param = message.match(types[a].regex);
			if (param) {
				types[a].params.push(_.get(param, '1', param[0]));
				message = message.replace(_.get(param, '0'), '');
			}
		} while (message.match(types[a].regex));
		if (types[a].params.length > 0) {
			commandName = a;
			if (params < 1) flags = [...flags, 'delete'];
			params = types[a].params
		}
	});

	if (!commandName) return;

	switch (commandName) {
		case 'c':
			commandName = 'card';
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
		case 'random':
		case 'randomhand':
			commandName = 'randomHand';
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
