const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const UserSchema = new Schema({
    image: String,
    fullname: String,
    email: String,
    gender: String,
    username: String,
    password: String,
    country: String,
    bio: String,
    website: String,
    posts: Array,
    followers: Array,
    following: Array,
    bids: Array,
    verified: Boolean,
    subscribed: Boolean,
    activity: [{
        user: String,
        price: String,
        type: String,
        date: Date,
    }]
});

const User = mongoose.model('users', UserSchema);

module.exports = User;