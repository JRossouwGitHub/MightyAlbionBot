//Initialize Discord object
const Discord = require('discord.js')
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions } = require('discord.js')
const client = new Discord.Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})
//Constants
const token = require("./config.json").DISCORD_TOKEN
const PREFIX = '!'
const commands = require("./commands.js").commands

//Called after login
client.on('ready', () => {
    console.log('MightyAlbionBot is Online!')
    client.user.setActivity('Albion Online', {type: "Playing"}) //Not working?
})

//On each message
client.on('messageCreate', (message) => {
    //Exit if not a command or message is from bot
    if(!message.content.startsWith(PREFIX) || message.author.bot) return

    //Process message
    const command = message.content.split(" ")[0].replace("!", "").toLowerCase() //Command after "!"
    const args = message.content.split(" ").slice(1) //Array of all words after command
    
    switch(command){
        case "ping":
            message.channel.send("pong!")
            break;
        case "hello":
            message.channel.send("Hello, " + message.author.username + "!")
            break;
        case 'help':
        case 'commands':
            let output = commands.map((cmd) => cmd.join(" - ")).join("\n")
            message.channel.send("Here is a list of helpful commands:\n" + output)
            break;
        default:
            message.channel.send("Sorry, I did not recognize that command. Please try again, or type `!help` or `!commands` for a list of commands.")
            break;
    }
})

//Login bot
client.login(token)