var mongoose = require('mongoose');
var Schema       = mongoose.Schema;
var ChatSchema   = new Schema({
    username: String,
    room:String, 
    message:String,
});

module.exports = mongoose.model('Chat', ChatSchema);