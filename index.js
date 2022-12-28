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
const commands = require("./utilities/commands.js").commands
const validate = require("./utilities/validation.js").validate
const messageEmbed = require('./utilities/messageEmbed.js').messageEmbed
const builds = require('./utilities/builds.js').builds
const reactions = require('./utilities/reactions.js')
const ContentQueue = require('./classes/ContentQueue.js').ContentQueue
let content = []

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
    const nickname = message.guild.members.cache.map(member => { if(member.user.username == message.author.username) return member.nickname}).toString().replace(",", "")
    switch(command){
        case "ping":
            if(!validate(message, null, 'odiousgspaz-test', 'Dev', null)) return
            message.channel.send("pong!")
            break;
        case "hello":
            if(!validate(message, null, null, null, null)) return
            message.channel.send("Hello, " + nickname + "!")
            break;
        case 'help':
        case 'commands':
            if(!validate(message, null, null, null, null)) return
            let output = commands.map((cmd) => cmd.join(" - ")).join("\n")
            message.channel.send("Here is a list of helpful commands:\n" + output)
            break;
        case 'embed':
            if(!validate(message, null, 'odiousgspaz-test', 'Dev', null)) return
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
        case 'start':
            if(!validate(message, null, 'odiousgspaz-test', 'Dev', null)) return
            if(args == 0){
                message.channel.send(messageEmbed(
                    'Content Party',
                    null,
                    'To start a content party, select (react) to one of the content option below:',
                    [{name: '1 - Fame Farming', value: '10 party size\u200B'}, {name: '2 - Roads', value: '7 party size\u200B'}, {name: '\u200B', value: '\u200B'}],
                    null
                )).then((msg) => {
                    msg.react('1️⃣')
                    msg.react('2️⃣')
                })
            } else {
                const newContent = new ContentQueue()
                newContent.id = Math.random().toString().slice(2).substring(0,4)
                newContent.size = args[0]
                content.push(newContent)
                message.channel.send('@here ' + nickname + ' started a custom party!')
                message.channel.send(messageEmbed(
                    newContent.id + ' - ' + nickname + ' started a custom ' + newContent.size + ' player party!',
                    null,
                    'To join the party, select (react) to one of the roles below:',
                    [{name: '🛡️ - TANK', value: builds.tank + '\u200B'}, {name: '⚔️ - DPS', value: builds.dps + '\u200B'}, {name: '⚕️ - HEALER', value: builds.healer + '\u200B'}, {name: '✳️ - SUPPORT', value: builds.support + '\u200B'}, {name: '\u200B', value: '\u200B'}],
                    null
                )).then((msg) => {
                    msg.react('🛡️')
                    msg.react('⚔️')
                    msg.react('⚕️')
                    msg.react('✳️')
                })
            }
            break;
        case 'check':
            const contentId = args[0]
            const aQueue = content.filter((aContent) => aContent.id == contentId)[0]
            if(!aQueue) {
                message.channel.send('This queue has ended.')
                return
            }
            let qTanks = []
            let qDPS = []
            let qHealers = []
            let qSupports = []
            aQueue.inQueue.map((aPlayer) => {
                switch(aPlayer[1]){
                    case '🛡️':
                        qTanks.push(aPlayer[0])
                        break;
                    case '⚔️':
                        qDPS.push(aPlayer[0])
                        break;
                    case '⚕️':
                        qHealers.push(aPlayer[0])
                        break;
                    case '✳️':
                        qSupports.push(aPlayer[0])
                        break;
                }
            })
            const tanksTitle = '🛡️ - TANKS (' + qTanks.length + ')'
            const tanksValue = qTanks.length > 0 ? qTanks.join(', ') : 'None'
            const dpsTitle = '⚔️ - DPS (' + qDPS.length + ')'
            const dpsValue = qDPS.length > 0 ? qDPS.join(', ') : 'None'
            const healersTitle = '⚕️ - HEALERS (' + qHealers.length + ')'
            const healersValue = qHealers.length > 0 ? qHealers.join(', ') : 'None'
            const supportsTitle = '✳️ - SUPPORTS (' + qSupports.length + ')'
            const supportsValue = qSupports.length > 0 ? qSupports.join(', ') : 'None'
            message.channel.send(messageEmbed(
                'Players in group (' + aQueue.inQueue.length + '/' + aQueue.size + ')',
                null,
                'See the roles below:',
                [
                    {
                        name: tanksTitle, 
                        value: tanksValue
                    }, 
                    {
                        name: dpsTitle, 
                        value: dpsValue
                    }, 
                    {
                        name: healersTitle, 
                        value: healersValue
                    }, 
                    {
                        name: supportsTitle, 
                        value: supportsValue
                    },
                    {name: '\u200B', value: '\u200B'}
                ],
                null
            ))
            break;
        case 'leave':
            if(args == 0) {
                message.channel.send('Please specify the queue ID, i.e. `!leave 1234`')
                return
            }
            if(content.filter((aContent) => aContent.id == args[0]).length == 0){
                message.channel.send('The queue you are trying to leave no longer exists.')
                return
            }
            content.map((aContent) => {
                if(aContent.id == args[0]){
                    aContent.inQueue = aContent.inQueue.filter((bQueue) => bQueue[0] != nickname)
                    message.channel.send(nickname + ' has left the queue ' + aContent.id)
                }
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
    const nickname = reaction.message.guild.members.cache.map(member => { if(member.user.username == user.username) return member.nickname}).toString().replace(",", "").replace(",", "")
    if(user.username == 'MightyAlbionBot') return
    //reaction.message.channel.send(user.username + ' reacted with: ' + reaction.emoji.name) - example
    switch(true){
        case reactions.content.includes(reaction.emoji.name):
            const newContent = new ContentQueue()
            content.push(newContent)
            content[content.indexOf(newContent)].create(reaction, nickname)
            break;
        case reactions.roles.includes(reaction.emoji.name):
            const contentTitle = reaction.message.embeds.map(embed => embed.title)[0]
            const aQueue = content.filter(aContent => contentTitle.includes(aContent.id))[0]
            if(!aQueue) {
                reaction.message.channel.send('This queue is no longer available to join.')
                return
            }
            content = content[content.indexOf(aQueue)].join(reaction, nickname, aQueue.type, content)
            break;
    }
});

//Login bot
client.login(token)