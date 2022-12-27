//To validate the server, i.e. command is valid for Mighty Albion Mob but no Mob Cartel
const validateServer = (source, target) => {
    if(target == null) return true

    return source.channel.guild.name.toLowerCase() == target.toLowerCase()
}

//To validate the channel to separate commands and uses
const validateChannel = (source, target) => {
    if(target == null) return true

    return source.channel.name.toLowerCase() == target.toLowerCase()
}

//To validate the author has the correct role to execute the command
const validateAuthor = (source, target) => {
    if(target == null) return true

    return source.member.roles.cache.find(role => role.name.toLowerCase() === target.toLowerCase())
}


//To validate the author is the correct user to execute the command
const validateUsername = (source, target) => {
    if(target == null) return true
    target.map((i) => i.toLowerCase()) //Set each Username in the list to lowercase
    return target.includes(source.author.username)
}

const validate = (message, server, channel, author, username) => {
    const _server = validateServer(message, server)
    const _channel = validateChannel(message, channel)
    const _author = validateAuthor(message, author)
    const _user = validateUsername(message, username)

    return (_server && _channel && _author && _user)
}

module.exports = {
    validate
}