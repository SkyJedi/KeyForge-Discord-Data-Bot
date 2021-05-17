const adminID = require('../config').adminID;

const restart = async ({ message, client }) => {
    if (message.author.id !== adminID) return;
    await message.channel.send('Restarting, M\'lord.');
    await client.shard.respawnAll();
};

module.exports = restart;
