const main = require('../index');
const { getFlagLang, setServerLanguage } = require('./fetch');

const language = ({message, flags, client}) => {
	const botRole = message.guild.roles.find(val => val.name === client.user.username);
	const userRoles = message.member.roles;
	if(botRole) {
		if(!userRoles.some(role => role.comparePositionTo(botRole) > 0)) {
			main.sendMessage(message, `${message.author.username} does not have a role high enough to change language`);
			resolve();
		} else {
			const language = getFlagLang(flags);
			setServerLanguage(message, client, flags).then(() => {
				main.sendMessage(message, `The default laguage for ${message.guild.name} has been sets as ${language}`);
			});
		}
	}
};

module.exports = language;
