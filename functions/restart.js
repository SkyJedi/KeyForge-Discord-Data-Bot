const adminID = require('../config').adminID;

const restart = async ({msg, client}) => {
    if (msg.author.id !== adminID) return;
    await msg.channel.send('Restarting, M\'lord.');
    client.shard.respawnAll();
};

module.exports = restart;
