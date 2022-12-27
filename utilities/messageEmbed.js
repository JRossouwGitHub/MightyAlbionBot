const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const file = new AttachmentBuilder('./Icons/8ecf9b7e9c60f476d382a249bae813a7.webp');
const MAMIcon = 'attachment://8ecf9b7e9c60f476d382a249bae813a7.webp'

const messageEmbed = (
        title, //Card title
        author, //Author of the card, i.e. {name: 'Mighty Albion Mob'}
        description, //Card description
        fields, //Fields in card, i.e. {name: 'Title1', value: 'Value for title 1'}, {name: 'Title2', value: 'Value for title 2'}
        footer //Bottom of card, i.e. {text: 'Mighty Albion Mob', iconURL: 'https://imgur.com/a/3jNXyuV'}
    ) => {
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title)
        .setAuthor(author ?? {name: 'Mighty Albion Mob', iconURL: MAMIcon})
        .setDescription(description)
        .setThumbnail(MAMIcon)
        .addFields(fields)
        .setTimestamp()
        .setFooter(footer ?? {text: 'Mighty Albion Mob', iconURL: MAMIcon})

    return {embeds: [embed], files: [file]}
}

module.exports = {
    messageEmbed
}