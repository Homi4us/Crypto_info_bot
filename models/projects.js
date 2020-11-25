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
    }
})

module.exports = mongoose.model('projects', Project);