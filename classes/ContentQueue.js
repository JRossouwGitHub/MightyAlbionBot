const messageEmbed = require('../utilities/messageEmbed.js').messageEmbed

class ContentQueue{
    constructor(type = 1, size = 0, inQueue = [], joinable = true, ready = false){
        this.id = Math.random().toString().slice(2).substring(0,4)
        this.type = type
        this.size = size
        this.inQueue = inQueue
        this.joinable = {
            tank: true,
            dps: true,
            healer: true
        }
        this.ready = ready
    }

    create(reaction, player){
        switch(reaction.emoji.name){
            case '1️⃣':
                reaction.message.channel.send('@here ' + player + ' started a Fame Farming party!')
                this.type = 1
                this.size = 10
                this.invite(reaction, player, 'Fame Farming', this.id)
                break;
        } 
        return this
    }

    invite(reaction, player, content){
        switch(content){
            case 'Fame Farming':
                reaction.message.channel.send(messageEmbed(
                    this.id + ' - ' + player + ' started a ' + content + ' party!',
                    null,
                    'To join the party, select (react) to one of the roles below:',
                    [{name: '🛡️ - TANK', value: 'Mace, Oathekeepers\u200B'}, {name: '⚔️ - DPS', value: 'Carving Sword, Greataxe, Permafrost, Reg Bow\u200B'}, {name: '⚕️ - HEALER', value: 'Holy, Nature\u200B'}, {name: '\u200B', value: '\u200B'}],
                    null
                )).then((msg) => {
                    msg.react('🛡️')
                    msg.react('⚔️')
                    msg.react('⚕️')
                })
                break;
        }
    }

    join(reaction, player, queue){
        const aRole = reaction.emoji.name
        if(this.inQueue.filter((aPlayer) => aPlayer[0] == player).length > 0){
            reaction.message.channel.send('You are already in party as '+ this.inQueue.filter((aPlayer) => aPlayer[0] == player)[0][1] +'.')
            return
        } 
        switch(queue){
            case 1:
                if(this.inQueue.length == this.size){
                    reaction.message.channel.send('Sorry, this party is already full.')
                    return
                }
                if(aRole == '🛡️' && this.inQueue.filter(aPlayer => aPlayer[1] == '🛡️') >= 2){
                    reaction.message.channel.send('Sorry, there are already enough ' + aRole + '. Try a different role.')
                    return
                }
                if(aRole == '⚔️' && this.inQueue.filter(aPlayer => aPlayer[1] == '⚔️') >= 6){
                    reaction.message.channel.send('Sorry, there are already enough ' + aRole + '. Try a different role.')
                    return
                }
                if(aRole == '⚕️' && this.inQueue.filter(aPlayer => aPlayer[1] == '⚕️') >= 2){
                    reaction.message.channel.send('Sorry, there are already enough ' + aRole + '. Try a different role.')
                    return
                }
                this.inQueue.push([player, aRole])
                reaction.message.channel.send('You joined as ' + aRole)
                break;
        } 
    }
}

module.exports = {
    ContentQueue
}