//To validate the server, i.e. command is valid for Mighty Albion Mob but no Mob Cartel
const validateServer = (source, target, required = true) => {
    if(!required) return true

    return source == target
}

//To validate the channel to separate commands and uses
const validateChannel = (source, target, required = true) => {
    if(!required) return true

    return source == target
}

//To validate the author has the correct role to execute the command
const validateAuthor = (source, target, required = true) => {
    if(!required) return true

    return source.roles.cache.find(role => role.name === target)
}

module.exports = {
    validateServer,
    validateChannel,
    validateAuthor
}