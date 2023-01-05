const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LootSplitSchema = new Schema({
    splitId: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    tab: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    group: {
        type: Array,
        default: []
    },
    bid: {
        type: Object,
        default: {
            player: "",
            amount: 0
        }
    },
    ends: {
        type: Object,
        default: {
            date: "",
            time: ""
        },
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = LootSplit = mongoose.model('lootsplit', LootSplitSchema)