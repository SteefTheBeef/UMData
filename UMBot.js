// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const discordConfig  = require('./discordConfig');

// Create a new client instance


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'



class UMBot {
    constructor() {
        this.isConnected = false;
        this.init();
    }

    init(callback) {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        // Log in to Discord with your client's token
        this.client.login(discordConfig.token);

        this.client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
            this.isConnected = true;
            // client.channels.cache.get('1054510765756919868').send('Testing!')
            if (callback) {
                callback();
            }
        });


    }

    sendMessage(message) {
        if (this.isConnected) {
            this.client.channels.cache.get('1073040567350607902').send(message)
        } else {
            this.init(() => {
               this.sendMessage(message);
            });
        }
    }

    sendNewRecordMessage(race, player, lapCount) {
        const lastRank = player.getLastRankHistory();
        this.sendMessage(`**${player.getNickName(true)}** just drove *TOP ${lastRank.position}: ${lastRank.totalTime}* on ${race.challengeEnvi}, ${race.challengeName}[${lapCount} laps]`)
    }

}
const umBot = new UMBot();
module.exports = umBot;
