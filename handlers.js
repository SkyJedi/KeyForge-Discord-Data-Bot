const knownCommands = require('./functions/index');
const commandPrefix = require('./config').prefix;
const version = require('./package').version;
const sites = ['https://www.keyforgegame.com/deck-details/',
	'https://decksofkeyforge.com/decks/',
	'https://keyforge-compendium.com/decks/',
	'https://burgertokens.com/pages/keyforge-deck-analyzer?deck='
];


// Called every time a message comes in:
const onMessage = (msg, client) => {
	if (msg.author.bot) return; // Ignore messages from the bot
	let params = [], commandName, flags = [];


	if (sites.some(a => msg.content.startsWith(a))) {
		const [site] = sites.filter(a => msg.content.startsWith(a));
		msg.content = `${commandPrefix}d ${msg.content.replace(site, '').slice(0, 36)}`;
		flags = ['delete', ...flags];
	}
	// This isn't a command since it has no prefix:
	if (!msg.content.includes(commandPrefix) && !msg.content.match(/[\[\]{}]/g)) return;

	flags = [...flags, ...msg.content.split(' ').filter(a => a.startsWith('-')).map(flag => flag.slice(1))];
	msg.content = msg.content.split(' ').filter(a => !a.startsWith('-')).join(' ');

	if (msg.content.includes(commandPrefix)) {
		if (msg.content.startsWith(commandPrefix)) params = msg.content.substr(1).split(' ');
		else params = msg.content.split(commandPrefix)[1].split(' ');
		commandName = params[0].toLowerCase();
		params = params.splice(1);
	} else if (msg.content.match(/]/g) && msg.content.match(/\[/g)) {
		let parse = msg.content.split('[');
		parse.forEach(sub => sub.includes(']') && params.push(sub.split(']')[0]));
		commandName = 'brackets';
	} else if (msg.content.match(/}/g) && msg.content.match(/{/g)) {
		let parse = msg.content.split('{');
		parse.forEach(sub => sub.includes('}') && params.push(sub.split('}')[0]));
		commandName = 'deck';
	}

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
