const path = require('path');
const {token} = require('./config');
const {ShardingManager} = require('discord.js');
const manager = new ShardingManager(path.join(__dirname, '/index.js'), {token});
console.info(new Date().toString())

manager.spawn().catch(console.error);
