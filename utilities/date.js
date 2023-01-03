function getWeeksDiff (aMember){
    const d = new Date()
    const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate()
    const newD = new Date(aMember.date_joined)
    const dateJoined = newD.getFullYear() + "-" + (newD.getMonth() + 1) + "-" + newD.getDate()
    const weeksDiff = Math.round((new Date(today) - new Date(dateJoined)) / (7 * 24 * 60 * 60 * 1000))
    return weeksDiff == 0 ? 1 : weeksDiff
}

module.exports = {
    getWeeksDiff
}