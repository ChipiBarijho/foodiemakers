const mongoose = require('mongoose');
const {Schema} = mongoose;

const User = require('./user');

const messageSchema = new Schema({
    message: String,
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    seen: Boolean 
}, {timestamps: true})

module.exports = mongoose.model('Message', messageSchema);