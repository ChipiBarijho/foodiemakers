// Models
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');

//Packages




module.exports.showChat = async (req, res) => {
    // console.log(req.app.get('socketio'))
    
    const {id} = req.params;
    const userId = req.user._id
    // if(req.user.chats){

    //     res.render('chats/chat', {chat, user1, user2, id, userChats})
    // }
    const chat = await Chat.findById(id).populate('messages')
    const user1 = await User.findById(chat.currentUser)
    const user2 = await User.findById(chat.userToContact)
    // console.log(req.user.chats)
    const chatIds = req.user.chats
    // const userChats = await Chat.find({_id: {$in: chatIds}}).populate('messages');
    const userChats = await Chat.find({_id: {$in: chatIds}}).populate({
        path: 'messages',
        populate: {
            path: 'message',
            path: 'sender'
        },
        path: 'currentUser',
        path: 'userToContact'
    }).populate('messages').populate('currentUser');

    // console.log(chat.messages, userId)
    chat.messages.forEach(function(message){
                
        if(message.seen === false && message.sender != userId){
            async function getMessageContent(){
                const messageId = message._id
                const messageContent = await Message.findByIdAndUpdate(messageId, {seen: true})
                // const test = message.findOneAndUpdate({seen: false})
                // console.log(messageContent)
            }
            getMessageContent()
            
        }
    })
    
    res.render('chats/chat', {chat, user1, user2, id, userChats, chatIds})
    // res.render('chats/chat',)
}

module.exports.createChatRoom = async (req, res) => {
    // Check for logged in user
    if(req.user._id){
        
        const currentUser = req.user._id
        const {userToContact} = req.body
        const user1 = await User.findById(currentUser)
        const user2 = await User.findById(userToContact)
        // console.log(user1.chats, user2.chats)
        // Check for already existing chat with array filter method -> filter() compares arrays and in this particular case it finds for matching chat.id 
        const chatExists = user1.chats.filter(element => user2.chats.includes(element));
        // console.log(chatExists)
        // // If chat exists, redirect to chat page
        if(chatExists != ''){
            // console.log('chat already exists')
            return res.redirect(`chat/${chatExists[0]}`)
        }
        // Create new chat 
        // console.log('creating new chat')
        const chat = new Chat({currentUser: currentUser, userToContact: userToContact});
        user1.chats.push(chat._id)
        user2.chats.push(chat._id)
        await user1.save();
        await user2.save();
        await chat.save();
        return res.redirect(`chat/${chat._id}`)
    }
    
    
    
}