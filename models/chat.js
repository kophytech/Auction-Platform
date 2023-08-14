const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const ChatRoomSchema = new Schema({
    postId: String,
    user: String,
    bidWinner: String,
    price: String,
    messages: [{
        sender: String,
        recipient: String,
        content: String,
        date: Date,
    }],
    date: Date,
});

const Chat = mongoose.model('chats', ChatRoomSchema);

module.exports = Chat;