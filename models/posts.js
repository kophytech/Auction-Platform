const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const PostSchema = new Schema({
    user: String,
    image: String,
    caption: String,
    hashtags: Array,
    date: Date,
    live: Boolean,
    likes: Array,
    chatroom: String,
    bids: [{
        bidder: String,
        price: Number,
        winner: Boolean,
        date: Date,
    }],
});

const Posts = mongoose.model('posts', PostSchema);

module.exports = Posts;