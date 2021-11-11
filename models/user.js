const mongoose = require('mongoose')
const {Schema} = mongoose
const passportLocalMongoose = require('passport-local-mongoose')
const Chat = require('./chat');

const BusinessSchema = new Schema({
    name: String,
    location: String,
    description: String
});
// module.exports = mongoose.model('Business', BusinessSchema);

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    business: [BusinessSchema],
    chats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Chat'
        }
    ]
});



UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);