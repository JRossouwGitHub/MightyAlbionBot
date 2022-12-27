const messageEmbed = require('../utilities/messageEmbed.js').messageEmbed

class ContentQueue{
    constructor(type = 1, size = 0, inQueue = [], joinable = true){
        this.id = Math.random().toString().slice(2).substring(0,4)
        this.type = type
        this.size = size
        this.inQueue = inQueue
        this.joinable = joinable
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

    join(reaction, player, queue, content){
        if(!this.joinable){
            reaction.message.channel.send('Sorry, you are unable to join this queue because it is either full or ended.')
        }
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
                reaction.message.channel.send(player + ' joined as ' + aRole)
                if(this.inQueue.length == this.size){
                    this.joinable = false
                    return this.ready(reaction, content)
                }
                break;
        } 
    }

    ready(reaction, content){
        reaction.message.channel.send('@here ' + this.id + ' - Group is ready!')
        content.map((aContent) => {
            this.inQueue.map((thisQueue) => {
                aContent.inQueue = aContent.inQueue.filter((aQueue) => aQueue[0] != thisQueue[0])
            })
        })

        content.map((aContent) => {
            if(aContent.inQueue.length == 0){
                content = content.filter(bContent => bContent.inQueue.length > 0)
            }
        })

        return content
    }
}

module.exports = {
    ContentQueue
}