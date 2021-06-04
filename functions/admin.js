const shardStatus = async ({ message, params, client }) => {
    const values = await client.shard.broadcastEval('this.shard.');
    console.log(values)
    let finalString = '';
    values.forEach((value) => {
        finalString += '• SHARD #' + value + '\n';
    });
    message.channel.send(finalString);
};

module.exports = { shardStatus };
