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
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const config = require('./config.json')
const uri = config.DB_CONNECTION_URI.replace("<username>", config.DB_USERNAME).replace("<password>", config.DB_PASSWORD)
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const CartelMember = require('./models/CartelMember.js')
const LootSplit = require('./models/LootSplit.js')
const token = require("./config.json").DISCORD_TOKEN
const PREFIX = '!'
const commands = require("./utilities/commands.js").commands
const validate = require("./utilities/validation.js").validate
const messageEmbed = require('./utilities/messageEmbed.js').messageEmbed
const builds = require('./utilities/builds.js').builds
const reactions = require('./utilities/reactions.js')
const ContentQueue = require('./classes/ContentQueue.js').ContentQueue
let content = []
const cartelFee = 200000
const getWeeksDiff = require('./utilities/date').getWeeksDiff

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
    const nickname = message.guild.members.cache.map(member => { if(member.user.username == message.author.username) return member.nickname == null ? message.author.username : member.nickname}).toString().replace(/,/g, "")
    switch(command){
        case "ping":
            if(!validate(message, null, ['odiousgspaz-test'], 'Dev', null)) return
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
            if(!validate(message, null, ['odiousgspaz-test'], 'Dev', null)) return
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
            if(!validate(message, null, ["party-setup"], null, null)) return
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
                    [{name: '🛡️ - TANK', value: builds.standard.tank + '\u200B'}, {name: '⚔️ - DPS', value: builds.standard.dps + '\u200B'}, {name: '⚕️ - HEALER', value: builds.standard.healer + '\u200B'}, {name: '✳️ - SUPPORT', value: builds.standard.support + '\u200B'}, {name: '\u200B', value: '\u200B'}],
                    null
                )).then((msg) => {
                    msg.react('🛡️')
                    msg.react('⚔️')
                    msg.react('⚕️')
                    msg.react('✳️')
                })
            }
            break;
        case 'check-group':
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
                contentId + ' - Players in group (' + aQueue.inQueue.length + '/' + aQueue.size + ')',
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
        case 'register':
            if(!validate(message, ["The Mob Cartel"], ['register'], null, null)) return
            const member = nickname
            const total_owing = cartelFee
            const total_paid = 0
            CartelMember.findOne({member: member})
            .then((aMember) => {
                if(aMember){
                    message.channel.send(aMember.member + ', you are already in bed with the Mighty Albion Cartel!')
                    return
                }
                CartelMember.findOneAndUpdate(
                    {
                        member: member
                    },
                    {
                        total_owing: total_owing,
                        total_paid: total_paid
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(member => {
                    console.log("DB - Member was inserted or updated")
                    message.channel.send(nickname + ' is now in bed with the Mighty Albion Cartel!')
                })
                .catch(err => {
                    console.log("DB - Member was not inserted or updated")
                    console.log(err)
                    message.channel.send('Sorry, there was an issue registering you with the Maighty Albion Cartel.')
                })
            })
            .catch((err) => {
                console.log(err)
            })
            break;
        case 'pay':
            if(!validate(message, ["The Mob Cartel"], ['fees'], null, null)) return
            CartelMember.findOne({member: nickname})
            .then((aMember) => {
                const weeksDiff = getWeeksDiff(aMember)
                const totalOwing = aMember.total_owing * weeksDiff
                const totalPaid = aMember.total_paid + (args[0] ? args[0] : cartelFee)
                CartelMember.findOneAndUpdate(
                    {
                        member: aMember.member
                    },
                    {
                        total_owing: totalOwing,
                        total_paid: totalPaid
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(member => {
                    console.log("DB - Member was inserted or updated")
                    message.channel.send(nickname + ' has paid the Mighty Albion Cartel fee!')
                })
                .catch(err => {
                    console.log("DB - Member was not inserted or updated")
                    console.log(err)
                    message.channel.send('Sorry, there was an issue paying your fee with the Maighty Albion Cartel.')
                })
            })
            .catch((err) => {
                message.channel.send(nickname + ', you need to `!register` before being able to pay.')
                console.log(err)
            })
            break;
        case 'owing':
            if(!validate(message, ["The Mob Cartel"], ['fees'], null, null)) return
            CartelMember.findOne({member: nickname})
            .then((aMember) => {
                const weeksDiff = getWeeksDiff(aMember)
                const totalOwing = aMember.total_owing * weeksDiff
                const totalPaid = aMember.total_paid
                const total_owing = (totalOwing - totalPaid).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                message.channel.send(nickname + ', you owe the Mighty Albion Cartel: $' + total_owing)
                CartelMember.findOneAndUpdate(
                    {
                        member: aMember.member
                    },
                    {
                        total_owing: totalOwing,
                        total_paid: totalPaid
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(member => {
                    console.log("DB - Member was inserted or updated")
                })
                .catch(err => {
                    console.log("DB - Member was not inserted or updated")
                    console.log(err)
                })
            })
            .catch((err) => {
                message.channel.send(nickname + ', you need to `!register` before being you owe anything.')
                console.log(err)
            })
            break;
        case 'members':
            if(!validate(message, ["The Mob Cartel"], ['fees'], null, null)) return
            CartelMember.find({})
            .then((members) => {
                const membersList = []
                let memberNames = ""
                let memberJoined = ""
                let memberOwings = ""
                members.map(aMember => {
                    const weeksDiff = getWeeksDiff(aMember)
                    const totalOwing = aMember.total_owing * weeksDiff
                    const totalPaid = aMember.total_paid
                    const newD = new Date(aMember.date_joined)
                    const dateJoined =  (newD.getDate() < 10 ? "0" + newD.getDate() : newD.getDate()) + "/" + (newD.getMonth() + 1 < 10 ? "0" + (newD.getMonth() + 1) : newD.getMonth() + 1) + "/" + newD.getFullYear()
                    const total_owing = (totalOwing - totalPaid).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    memberNames += aMember.member+'\n'
                    memberJoined += dateJoined+'\n'
                    memberOwings += "$"+total_owing+'\n'

                    
                    CartelMember.findOneAndUpdate(
                        {
                            member: aMember.member
                        },
                        {
                            total_owing: totalOwing,
                            total_paid: totalPaid
                        },
                        {
                            new: true,
                            upsert: true
                        }
                    )
                    .then(member => {
                        console.log("DB - Member was inserted or updated")
                    })
                    .catch(err => {
                        console.log("DB - Member was not inserted or updated")
                        console.log(err)
                    })
                })
                membersList.push({
                    name: "Name",
                    value: memberNames,
                    inline: true
                })
                membersList.push({
                    name: "Joined",
                    value: memberJoined,
                    inline: true
                })
                membersList.push({
                    name: "Owing",
                    value: memberOwings,
                    inline: true
                })
                membersList.push({
                    name: '\u200B',
                    value: '\u200B'
                })
                message.channel.send(messageEmbed(
                    'Mighty Albion Cartel Members',
                    null,
                    'Here is a list of all members and their details:',
                    membersList,
                    null
                ))
            })
            .catch((err) => {
                console.log(err)
            })
            break;
        case 'split':
            const splitTab = args[0]
            const splitAmount = args[1]
            if(!splitTab || !splitAmount){
                message.channel.send("Please specify the Split Tab and Amount, i.e. `!split 1/2/3 2000000`")
                return
            }
            const d = new Date()
            d.setDate(d.getDate() + 1)
            const splitEndDate = (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + "/" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) + "/" + d.getFullYear() 
            const splitEndTime = "08:00pm NZST"
            d.setDate(d.getDate() - 1)
            const newLootSplit = {
                splitId: Math.random().toString().slice(2).substring(0,4),
                tab: splitTab,
                amount: splitAmount,
                ends: {
                    date: splitEndDate,
                    time: splitEndTime
                },
                date: d.getFullYear() + "-" + (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate())
            }
            LootSplit.create(newLootSplit)
            .then(lootsplit => {
                console.log("DB - LootSplit was inserted or updated")
                message.channel.send(messageEmbed(
                    nickname + ' registered split ' + newLootSplit.splitId,
                    null,
                    'Here are the details of the split:',
                    [
                        {name: 'Split ID', value: lootsplit.splitId.toString()},
                        {name: 'Split Tab', value: lootsplit.tab.toString()}, 
                        {name: 'Split Amount', value: "$" + lootsplit.amount.toString()}, 
                        {name: 'Players Owed', value: lootsplit.group.length > 0 ? lootsplit.group.join("\n") : "N/A"}, 
                        {name: 'Bid', value: (lootsplit.bid.player == "" ? "N/A" : lootsplit.bid.player) + ' - $' + lootsplit.bid.amount.toString()},
                        {name: 'Ends', value: lootsplit.ends.date.toString() + " - " + lootsplit.ends.time.toString()},
                        {name: '\u200B', value: '\u200B'}
                    ],
                    null
                ))
            })
            .catch(err => {
                console.log("DB - LootSplit was not inserted or updated")
                console.log(err)
            })
            break;
        case 'check-split':
            const splitId = args[0]
            if(!splitId){
                message.channel.send("Please specify the Split ID, i.e. `!check-split 0123`")
                return
            }
            LootSplit.findOne({splitId: splitId})
            .then(lootsplit => {
                if(!lootsplit){
                    message.channel.send("Sorry, a Loot Split with ID `" + splitId + "` was not found. Please check your ID and try again.")
                    return
                }
                message.channel.send(messageEmbed(
                    'Checking Loot Split: ' + lootsplit.splitId,
                    null,
                    'Here are the details of the split:',
                    [
                        {name: 'Split ID', value: lootsplit.splitId.toString()},
                        {name: 'Split Tab', value: lootsplit.tab.toString()}, 
                        {name: 'Split Amount', value: "$" + lootsplit.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}, 
                        {name: 'Players Owed', value: lootsplit.group.length > 0 ? lootsplit.group.join("\n") : "N/A"}, 
                        {name: 'Bid', value: (lootsplit.bid.player == "" ? "N/A" : lootsplit.bid.player) + ' - $' + lootsplit.bid.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")},
                        {name: 'Ends', value: lootsplit.ends.date.toString() + " - " + lootsplit.ends.time.toString()},
                        {name: '\u200B', value: '\u200B'}
                    ],
                    null
                ))
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
            })
            break;
        case 'split-add':
            const splitIdAdd = args[0]
            const playersToAdd = args.filter(cmd => cmd != splitIdAdd)
            if(!splitIdAdd){
                message.channel.send("Please specify the Split ID, i.e. `!split-add 0123`")
                return
            }
            if(playersToAdd.length < 1) {
                message.channel.send("Please specify the players to add, i.e. `!split-add 0123 Player1 Player2 etc...`")
                return
            }
            LootSplit.findOne({splitId: splitIdAdd})
            .then(lootsplit => {
                if(!lootsplit){
                    message.channel.send("Sorry, a Loot Split with ID `" + splitIdAdd + "` was not found. Please check your ID and try again.")
                    return
                }
                playersToAdd.concat(lootsplit.group)
                const uniquePlayersToAdd = [... new Set(playersToAdd)]
                LootSplit.findOneAndUpdate(
                    {
                        splitId: splitIdAdd
                    },
                    {
                        group: uniquePlayersToAdd
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(res => {
                    message.channel.send("Succesfully added " + res.group.join(", ") + " to Loot Split " + res.splitId)
                })
                .catch(err => {
                    message.channel.send("Sorry, something went wrong.")
                    console.log(err)
                })
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
            })
            break;
        case 'split-remove':
            const splitIdRemove = args[0]
            const playersToRemove = args.filter(cmd => cmd != splitIdRemove)
            if(!splitIdRemove){
                message.channel.send("Please specify the Split ID, i.e. `!split-remove 0123`")
                return
            }
            if(playersToRemove.length < 1) {
                message.channel.send("Please specify the players to remove, i.e. `!split-remove 0123 Player1 Player2 etc...`")
                return
            }
            LootSplit.findOne({splitId: splitIdRemove})
            .then(lootsplit => {
                if(!lootsplit){
                    message.channel.send("Sorry, a Loot Split with ID `" + splitIdRemove + "` was not found. Please check your ID and try again.")
                    return
                }
                const updatedPlayers = lootsplit.group.filter(g => !playersToRemove.includes(g))
                LootSplit.findOneAndUpdate(
                    {
                        splitId: splitIdRemove
                    },
                    {
                        group: updatedPlayers
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(res => {
                    message.channel.send("Succesfully removed " + playersToRemove.join(", ") + " from Loot Split " + res.splitId)
                })
                .catch(err => {
                    message.channel.send("Sorry, something went wrong.")
                    console.log(err)
                })
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
            })
            break;
        case 'bid':
            const splitIdBid = args[0]
            const bidAmount = parseInt(args[1])
            if(!splitIdBid){
                message.channel.send("Please specify the Split ID, i.e. `!bid 0123`")
                return
            }
            if(!bidAmount){
                message.channel.send("Please specify the amount you want to bid, i.e. `!bid 0123 100000`")
                return
            }
            LootSplit.findOne({splitId: splitIdBid})
            .then(lootsplit => {
                if(!lootsplit){
                    message.channel.send("Sorry, a Loot Split with ID `" + splitIdBid + "` was not found. Please check your ID and try again.")
                    return
                }
                //This needs more thought
                // if(!lootsplit.group.includes(nickname)){
                //     message.channel.send("You cannot bid on this split because you are not part of the split group.")
                //     return
                // }
                const today = new Date()
                const splitDatePart = lootsplit.ends.date.split("/")
                const splitDate = new Date(splitDatePart[2] + "-" + splitDatePart[1] + "-" + splitDatePart[0] + "T20:00:00.000Z")
                if(today > splitDate){
                    message.channel.send("You cannot bid on this split because it has ended on " + lootsplit.ends.date +".")
                    return
                }
                if(((bidAmount / lootsplit.amount) * 100) < 50){
                    message.channel.send("Please make a bid that is at least half the price of the total or higher (bid "+ (lootsplit.amount / 2 ? lootsplit.amount / 2 : 100000) +" or more).")
                    return
                }
                if(bidAmount < (lootsplit.bid.amount + 100000)){
                    message.channel.send("The minumum bid is 100000 more than the last (bid "+(lootsplit.bid.amount + 100000)+" or more).")
                    return
                }
                if(bidAmount > lootsplit.amount){
                    message.channel.send("Your bid of " + bidAmount + " is higher than the total split value of " + lootsplit.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
                    return
                }
                LootSplit.findOneAndUpdate(
                    {
                        splitId: splitIdBid
                    },
                    {
                        bid: {
                            player: nickname,
                            amount: bidAmount
                        },
                        owe: bidAmount / lootsplit.group.length
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(res => {
                    message.channel.send(nickname + " bid $" + bidAmount)
                })
                .catch(err => {
                    message.channel.send("Sorry, something went wrong.")
                    console.log(err)
                })
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
            })
            break;
        case 'split-pay':
            const splitIdPay = args[0]
            const playersPaid = args.filter(cmd => cmd != splitIdPay)
            if(!splitIdPay){
                message.channel.send("Please specify the Split ID, i.e. `!split-pay 0123`")
                return
            }
            if(playersPaid.length == 0){
                message.channel.send("Please specify the players you want to pay, i.e. `!split-pay 0123 Player1 Player2 etc...`")
                return
            }
            LootSplit.findOne({splitId: splitIdPay})
            .then(lootsplit => {
                if(!lootsplit){
                    message.channel.send("Sorry, a Loot Split with ID `" + splitIdPay + "` was not found. Please check your ID and try again.")
                    return
                }
                if(nickname.toLowerCase() != lootsplit.bid.player.toLowerCase()){
                    console.log(nickname)
                    console.log(lootsplit.bid.player)
                    message.channel.send("You cannot pay out if you did not win this split.")
                    return
                }
                const today = new Date()
                const splitDatePart = lootsplit.ends.date.split("/")
                const splitDate = new Date(splitDatePart[2] + "-" + splitDatePart[1] + "-" + splitDatePart[0] + "T20:00:00.000Z")
                if(today < splitDate){
                    message.channel.send("You cannot pay out when the split is still active (ends on " + lootsplit.ends.date + " - " + lootsplit.ends.time +".")
                    return
                }
                if(lootsplit.group.filter(g => playersPaid.includes(g)).length == 0){
                    message.channel.send("You cannot pay " + playersPaid.join(", ") + " because they (one or more players) are not in the split group list.")
                    return
                }
                const updatedPlayers = lootsplit.group.filter(g => !playersPaid.includes(g))
                LootSplit.findOneAndUpdate(
                    {
                        splitId: splitIdPay
                    },
                    {
                        group: updatedPlayers
                    },
                    {
                        new: true,
                        upsert: true
                    }
                )
                .then(res => {
                    message.channel.send(nickname + " paid " + playersPaid.join(", ") + " for Loot Split " + res.splitId)
                })
                .catch(err => {
                    message.channel.send("Sorry, something went wrong.")
                    console.log(err)
                })
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
            })
            break;
        case 'split-owing':
            LootSplit.find()
            .then(lootsplit => {
                let updatedLootSplit = lootsplit.filter(ls => {
                    const today = new Date()
                    const splitDatePart = ls.ends.date.split("/")
                    const splitDate = new Date(splitDatePart[2] + "-" + splitDatePart[1] + "-" + splitDatePart[0] + "T20:00:00.000Z")
                    if(ls.bid.player.toLowerCase() == nickname.toLowerCase() && today > splitDate){
                        return ls
                    }
                })
                if(updatedLootSplit.length == 0 || updatedLootSplit == '' || updatedLootSplit == undefined || updatedLootSplit == null){
                    message.channel.send(nickname + " has no debt to pay.")
                    return
                }
                let playersOwed = ""
                updatedLootSplit.map(ls => playersOwed += nickname + ", you owe `" + ls.group.join(" & ") + "` $" + ls.owe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " each for Loot Split " + ls.splitId + "\n")
                message.channel.send(playersOwed)
            })
            .catch(err => {
                message.channel.send("Sorry, something went wrong.")
                console.log(err)
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
    const nickname = reaction.message.guild.members.cache.map(member => { if(member.user.username == user.username) return member.nickname == null ? user.username : member.nickname}).toString().replace(/,/g, "")
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