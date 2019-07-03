const path = require('path');
const token = require('./config').token;
const {ShardingManager} = require('discord.js');
const manager = new ShardingManager(path.join(__dirname, '/index.js'), {token});
manager.spawn().catch(console.error);