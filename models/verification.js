const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const verificationSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true
    },
    dateCreated: {
        type: String,
        default: Date.now(),
        expires: 600
    }
});

const verification = mongoose.model('verification', verificationSchema);

module.exports = verification;