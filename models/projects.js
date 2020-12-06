const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var Project = new Schema({
    name:{
        type:String,
    },
    address:{
        type:String
    },
    link:{
        type:String
    },
    balance_1h:{
        type: Number,
        default:0
    },
    balance_24h:{
        type:Number,
        default: 0
    }
})

module.exports = mongoose.model('projects', Project);