//Initialize Discord object
const Discord = require('discord.js')
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, Events, Partials } = require('discord.js')
const client = new Discord.Client(
    { 
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction]
    }
)
//Constants
const token = require("./config.json").DISCORD_TOKEN
const PREFIX = '!'
const commands = require("./commands.js").commands
const validate = require("./validation.js").validate
const messageEmbed = require('./messageEmbed.js').messageEmbed

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
            if(!validate(message, null, 'odiousgspaz-test', 'Dev')) return
            message.channel.send("pong!")
            break;
        case "hello":
            if(!validate(message, null, null, null)) return
            message.channel.send("Hello, " + message.author.username + "!")
            break;
        case 'help':
        case 'commands':
            if(!validate(message, null, null, null)) return
            let output = commands.map((cmd) => cmd.join(" - ")).join("\n")
            message.channel.send("Here is a list of helpful commands:\n" + output)
            break;
        case 'embed':
            if(!validate(message, null, 'odiousgspaz-test', 'Dev')) return
            message.channel.send(messageEmbed(
                'This is a test card',
                null,
                'We are testing a card',
                [{name: 'Field Title', value: 'Field Value'}, {name: '\u200B', value: '\u200B'}, {name: 'Field Title', value: 'Field Value', inline: true}, {name: 'Field Title', value: 'Field Value', inline: true}, {name: 'Field Title', value: 'Field Value', inline: true}],
                null
            )).then((msg) => {
                msg.react('1️⃣')
                msg.react('2️⃣')
                msg.react('3️⃣')
                msg.react('4️⃣')
                msg.react('5️⃣')
                msg.react('6️⃣')
                msg.react('7️⃣')
                msg.react('8️⃣')
                msg.react('9️⃣')
            })
            break;
        default:
            message.channel.send("Sorry, I did not recognize that command. Please try again, or type `!help` or `!commands` for a list of commands.")
            break;
    }
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	// When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
    if(user.username == 'MightyAlbionBot') return
    reaction.message.channel.send(user.username + ' reacted with: ' + reaction.emoji.name)
});

//Login bot
client.login(token)