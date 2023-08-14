const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const HashTagsSchema = new Schema({
    tag: String,
    users: Array,
    posts: Array,
    count: Number,
});

const HashTags = mongoose.model('hashtags', HashTagsSchema);

module.exports = HashTags;
