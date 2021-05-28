const Discord = require('discord.js');
const db = require('./db.js');
const client = new Discord.Client();
const commands = require("./comms.js"); 
const fs = require('fs');

let config = require('./botconfig.json')
let token = config.token;
let prefix = config.prefix;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.generateInvite(["ADMINISTRATOR"]).then(link =>{
        console.log(link);
  })
});

client.on('message', msg => {
  if (msg.author.username != client.user.username && msg.author.discriminator != client.user.discriminator) {
    var userCommand = msg.content.trim() + " ";
    var userCommand_name = userCommand.slice(0, userCommand.indexOf(" "));
    var messArr = userCommand.split(" ");
    for (command_count in commands.comms) {
      var command = prefix + commands.comms[command_count].name;
      if (command == userCommand_name) {
        commands.comms[command_count].out(client, msg, messArr);
      }
    }
  }
});

client.login(token);