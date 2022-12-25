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

const validate = (message, server, channel, author) => {
    const _server = validateServer(message, server)
    const _channel = validateChannel(message, channel)
    const _author = validateAuthor(message, author)

    return (_server && _channel && _author)
}

module.exports = {
    validate
}