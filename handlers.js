const knownCommands = require('./functions/index');
const commandPrefix = require('./config').prefix;
const version = require('./package').version;
const langs = ['en', 'de', 'es', 'fr', 'it', 'pl', 'pt', 'zh'];
const sets = {cota: 341, aoa: 435};


// Called every time a message comes in:
const onMessage = (msg, client) => {
	if (msg.author.bot) return; // Ignore messages from the bot

	// This isn't a command since it has no prefix:
	if (!msg.content.includes(commandPrefix) && !msg.content.match(/[\[\]{}]/g)) return;
	let params = [], commandName, lang = 'en', set, message = msg.content.toLowerCase();

	if (message.split(' ').some(a => a.startsWith('-'))) {
		const flags = message.split(' ').filter(a => a.startsWith('-'));
		flags.forEach(flag => {
			flag = flag.slice(1);
			if (langs.includes(flag)) lang = flag;
			if (Object.keys(sets).includes(flag)) set = sets[flag];
		});
		message = message.split(' ').filter(a => !a.startsWith('-')).join(' ');
	}

	if (message.includes(commandPrefix)) {
		if (message.startsWith(commandPrefix)) params = message.substr(1).split(' ');
		else params = message.split(commandPrefix)[1].split(' ');
		commandName = params[0].toLowerCase();
		params = params.splice(1);
	} else if (message.match(/]/g) && message.match(/\[/g)) {
		let parse = message.split('[');
		parse.forEach(sub => sub.includes(']') && params.push(sub.split(']')[0]));
		commandName = 'brackets';
	} else if (message.match(/}/g) && message.match(/{/g)) {
		let parse = message.split('{');
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
		console.log(`${msg.author.username}, ${commandName}, ${params}, ${new Date()}`);
		knownCommands[commandName](msg, params, client, lang, set);
	}

};

// Called every time the bot connects to Twitch chat:
const onReady = client => {
	console.log(`Logged in as ${client.user.username}!`);
	console.log(`Version: ${version}`);
};

exports.onMessage = onMessage;
exports.onReady = onReady;
