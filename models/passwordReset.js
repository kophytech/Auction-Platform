const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Schema and model

const PasswordResetSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    resetLink: {
        type: String,
        required: true
    },
    dateCreated: {
        type: String,
        default: Date.now(),
        expires: 600
    }
});

const passwordreset = mongoose.model('passwordReset', PasswordResetSchema);

module.exports = passwordreset;