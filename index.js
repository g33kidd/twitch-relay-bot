const config = require("./config.json");
const { ChatClient } = require("dank-twitch-irc");
const Discord = require("discord.js");
const discordClient = new Discord.Client();

class RelayBot {
  constructor() {
    this.twitchClient = new ChatClient({
      username: config.twitchUsername,
      password: config.twitchPassword,
    });
    this.discordClient = new Discord.Client();
  }

  // Handles connecting the services and initializing events.
  connect() {
    this.initEvents();
    this.discordClient.login(config.discordBotToken);
    this.twitchClient.connect();
    this.twitchClient.join(config.twitchChannel);
  }

  initEvents() {
    this.twitchClient.on("ready", () => {
      let channel = this.discordClient.channels.find("id", config.discordChannelId);
      channel.send("Hey I'm here to relay messages!");
    });

    this.twitchClient.on("PRIVMSG", msg => {
      this.discordClient.channels.get(config.discordChannelId).send(`<${msg.senderUsername}>: ${msg.messageText}`);
    });

    this.discordClient.on("ready", () => {
      this.twitchClient.say(config.twitchChannel, config.twitchWelcomeMessage || "I am here to relay your messages to discord!");
    });

    this.discordClient.on("message", msg => {
      // Ignore all bot messages.
      if (msg.author.bot) return;

      this.twitchClient.say(config.twitchChannel, `$<{msg.author.username}>: ${msg.cleanContent}`);
    });
  }
}

let bot = new RelayBot();
bot.connect();

// let client = new ChatClient();

// client.on("")

// client.on("ready", () => console.log("Successfully connected to chat"));
// client.on("close", error => {
//   if (error != null) {
//     console.error("Client closed due to error", error);
//   }
// });

// client.on("PRIVMSG", msg => {
//   console.log(`[#${msg.channelName}] ${msg.displayName}: ${msg.messageText}`);
// });

// // See below for more events

// client.connect();
// client.join(config.twitchChannel);