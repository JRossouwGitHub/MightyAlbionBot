const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartelMemberSchema = new Schema({
    member: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    total_owing: {
        type: Number,
        required: true
    },
    total_paid: {
        type: Number,
        required: true
    },
    date_joined: {
        type: Date,
        default: Date.now
    }
})

module.exports = CartelMember = mongoose.model('cartelmember', CartelMemberSchema)