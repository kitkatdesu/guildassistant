const secret = require('./config.json');
const express = require('express');
import discord = require('discord.js');
const logger = require('./shardLogger.js');
import { Shard } from "discord.js";
const messageRecieving = require('./sharderMessageReciever.js');
var keymetrics = require('pmx').probe();

/*console.log(
    "  ____  _____  __ __  ____     ___\n" +
    " /    T|     T|  T  T|    \   /  _]\n" +
    "Y  o  |l__/  ||  |  ||  D  ) /  [_\n" +
    "|     ||   __j|  |  ||    / Y    _]\n" +
    "|  _  ||  /  ||  :  ||    \ |   [_\n" +
    "|  |  ||     |l     ||  .  Y|     T\n" +
    "l__j__jl_____j \__,_jl__j\_jl_____j\n");*/

var devEnvironment: Boolean = secret["devEnvironment"];

if (!devEnvironment) {

    logger.bootloaderLog("Starting Sharding Manager....");

    // Change this to an integer if you want custom shards.
    var total_shards = null;

    var sharder: discord.ShardingManager;

    if (total_shards == null) {
        sharder = new discord.ShardingManager('shard.js', {
            respawn: true,
            token: secret.authToken
        })
    }
    else {
        sharder = new discord.ShardingManager('shard.js', {
            respawn: true,
            token: secret.authToken,
            totalShards: total_shards
        })
    }

    sharder.on('launch', shard => logger.shardManagerLog(`Launching shard ${shard.id}. ${(sharder.totalShards - sharder.shards.size) == 0 ? "All shards launched." : `Total shards launched: ${sharder.shards.size}. Shards remaining: ${sharder.totalShards - sharder.shards.size}`}`));

    var totalShardsKeymetrics = keymetrics.metric({
        name: 'Shards Online',
        value: function () {
            return sharder.shards.size;
        }
    });

    messageRecieving(sharder, function (sender: Shard, message) {
        /*if (message.EVENT === "CONNECTION_SUCCESS") {
            logger.shardLog("Online. API listening on " + message.DATA.PORT, sender.id)
        }*/
        /*
         All current events:
         Event Title | Data Sent: Data Type
         CONNECTION_SUCCESS | PORT: number (Shard API port that it is now listening on)
         SHARD_INIT
         */
    });

    sharder.spawn(this.totalShards).catch(function (err) {
        logger.shardManagerLog("[Spawning Error] " + err);
    });
}
else {
    logger.bootloaderLog("Development environment initialized. In this specialized environment, all sharding functions & all APIs have been disabled.");
    logger.bootloaderLog("Sharding disabled. Starting Azure client...");
    // dirty fix
    require('./shard.js');
}