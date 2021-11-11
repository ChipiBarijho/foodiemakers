const mongoose = require('mongoose');
const {Schema} = mongoose;

const Message = require('./message');
const User = require('./user');

const chatSchema = new Schema({
    currentUser:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    userToContact:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }
    ]
})

module.exports = mongoose.model('Chat', chatSchema);