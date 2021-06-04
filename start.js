const path = require('path');
const { token, Patreon } = require('./config');
const { version } = require('./package');
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager(path.join(__dirname, '/index.js'), { token });
console.info(new Date().toString());

manager.spawn().catch(console.error);

manager.on('shardCreate', (shard) => {

    shard.on('death', (process) => {
        console.error('Shard ' + shard.id + ' closed unexpectedly! PID: ' + process.pid + '; Exit code: ' + process.exitCode + '.');

        if (process.exitCode === null) {
            console.warn(
                'WARNING: Shard ' + shard.id + ' exited with NULL error code. This may be a result of a lack of available system memory. Ensure that there is enough memory allocated to continue.');
        }
    });

    shard.on('disconnect', (event) => {
        console.warn('Shard ' + shard.id + ' disconnected. Dumping socket close event...');
        console.log(event);
    });

    shard.on('ready', async () => {
        const name = await shard.fetchClientValue('user.username');
        console.info(`${name}. Shard ${shard.id}/${manager.totalShards - 1}. Version ${version}`);

        if (shard.id === manager.totalShards - 1) {
            const message = await manager.broadcastEval(`(${loadMessage}).call(this, '${Patreon.channel}', '${Patreon.message}')`)
        }
    });
});

const loadMessage = async (channelId, messageId) => {
    const channel = this.channels.cache.get(channelId);
    if (!channel) return null;
    return channel.messages.fetch(messageId);
};
