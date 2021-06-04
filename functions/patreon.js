const main = require('../index');
const Discord = require('discord.js');

const patreon = async ({ message }) => {
    const embed = new Discord.MessageEmbed()
        .setColor('7BFE86')
        .setTitle(`**SkyJedi's Patreon**`)
        .setDescription(`Click [here](https://www.patreon.com/SkyJedi) find out how you can support this and other projects!`);
    await main.sendMessage({ message, embed });
};

module.exports = patreon;
