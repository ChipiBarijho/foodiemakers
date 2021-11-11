if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


// Require packages and utils
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const dbUrl = process.env.DB_URL;
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const http = require('http')
const socketio = require('socket.io')
const catchAsync = require('./utils/catchAsync')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


// Require Joi Schemas
const {productSchema, reviewSchema} = require('./schemas.js')

// Require models
const Product = require('./models/product');
const { findByIdAndUpdate } = require('./models/product');
const User = require('./models/user')
const Chat = require('./models/chat')
const Message = require('./models/message')

// Routers
const productsRoutes = require('./routes/products')
const reviewsRoutes = require('./routes/reviews')
const usersRoutes = require('./routes/users')
const chatsRoutes = require('./routes/chats')

// Connecting to mongodb
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();
// socket.io
const server = http.createServer(app);
// const io = socketio(server);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000/chat",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});



app.use(express.json()); // express json parser
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(mongoSanitize());
// app.set('socketio', io)
io.on('connection', socket =>{
    
    
    const userSocketId = socket.id
    // Joining room from req.params.id AND joining all the other rooms where the user is in
    socket.on('join', roomName =>{
      
        const {currentUserChats} = roomName
        socket.leave(roomName.roomId)
        socket.removeAllListeners(`emitmessage`)
        
        
        // Join every user's rooms
        const chatIds = roomName.chatIds // String of all user's chat ids separated by a comma 
        const chats = chatIds.split(',') // Splitting the string into an array.
        // console.log(chats)
        chats.forEach(function(chat){
            socket.join(chat) // Joining the user's every single room 
        });
        // socket.join(roomName.roomId);
        
        
        
        
        // console.log(referer[4])
        socket.on('chatMessage', msg => {
            async function getSockets(){
                const getUsersInRoom = await io.in(roomName.roomId).fetchSockets();
                
                



                let totalUsers = getUsersInRoom.length
                
                const message = msg.msg
                const currentUserId = msg.currentUserId
                const receiver = msg.receiver
                const roomId = roomName.roomId
                // console.log(currentUserId, msg.receiver)
                // Send message to client
                io.to(roomName.roomId).emit('message', {message, currentUserId, totalUsers, roomId});
                
                        
                //     });
                async function getUserData(){
                    const user = await User.findById(currentUserId)
                    const id = roomName.roomId
                    if(user.business != ''){
                        const username = user.business[0].name
                        io.to(roomName.roomId).emit('sideChatMessages', {message, username, id});
                    } else{
                        const username = user.username
                        io.to(roomName.roomId).emit('sideChatMessages', {message, username, id});
                    }
                    
                }
                getUserData()

                
          
                const handshakeReferer = socket.handshake.headers.referer
                const referer = handshakeReferer.split('/')
                // console.log(handshakeReferer)
                // console.log(getUsersInRoom.length, currentUserId, receiver)
            

                if(totalUsers === 2 && getUsersInRoom[0].handshake.headers.referer == getUsersInRoom[1].handshake.headers.referer){
                    // console.log('triggered in the same page')
                    newMessageSeen()
                    async function newMessageSeen(){
                    // const newMessage = await Chat.findByIdAndUpdate(roomName.roomId, {messages:{message: message, sender: roomName.currentUserId}})
                    const chat = await Chat.findById(roomName.roomId)
                    const newMessage = new Message({message: msg.msg, sender: roomName.currentUserId, receiver: receiver, seen: true})
                    chat.messages.push(newMessage)
                    await newMessage.save()
                    await chat.save()
                    }
                } else if(totalUsers === 2 && getUsersInRoom[0].handshake.headers.referer != getUsersInRoom[1].handshake.headers.referer){
                    // console.log('triggered NOT in the same page')
                    newMessageNotSeen()
                    async function newMessageNotSeen(){
                    // const newMessage = await Chat.findByIdAndUpdate(roomName.roomId, {messages:{message: message, sender: roomName.currentUserId}})
                    const chat = await Chat.findById(roomName.roomId)
                    const newMessage = new Message({message: msg.msg, sender: roomName.currentUserId, receiver: receiver, seen: false})
                    chat.messages.push(newMessage)
                    await newMessage.save()
                    await chat.save()
                    }
                } else if(totalUsers === 1){
                    newMessageNotSeen()
                    async function newMessageNotSeen(){
                    // const newMessage = await Chat.findByIdAndUpdate(roomName.roomId, {messages:{message: message, sender: roomName.currentUserId}})
                    const chat = await Chat.findById(roomName.roomId)
                    const newMessage = new Message({message: msg.msg, sender: roomName.currentUserId, receiver: receiver, seen: false})
                    chat.messages.push(newMessage)
                    await newMessage.save()
                    await chat.save()
                    }
                }    
                
            }
            getSockets();
        });
        
        
        socket.on('disconnect', () => {
            // console.log(socket.id + ' ==== disconnected');
            socket.removeAllListeners();
        });
       
    })

    socket.on('sideChat', data =>{
        const {currentUserId, roomId} = data
        async function getUserData(){
            const user = await User.findById(currentUserId)
            user.chats.forEach(function(chatId){
                async function getChatData(){
                    const chat = await Chat.findById(chatId).populate('messages')
                    if(chat._id != roomId){
                        const lastMessage = chat.messages[chat.messages.length - 1]
                        io.to(roomId).emit('sideChatMessages', lastMessage)
                    }
                    
                }
                getChatData()
            })
        }
        getUserData()
    })



    
    // For inbox messages
    socket.on('UserId', data =>{
        const {currentUserId2, socketId} = data
        // console.log(socketId)
        async function getUserData(){
            const user = await User.findById(currentUserId2)
            // user.chats.forEach(function(chat){
            
            
            async function getUserChats(){
                // const lastMessages = []
                for(const chat of user.chats){
                    // const chatContent = await Chat.findById(chat).populate('messages')
                    const chatContent = await Chat.findById(chat).populate({
                        path: 'messages',
                        populate: {
                            // path: 'message',
                            path: 'sender',
                            populate:{
                                path: '_id',
                                // path: 'email',
                                path: 'username',
                                path: 'business'
                            },
                            // path: 'seen'
                        }
                    })
                    // console.log(chatContent)
                    const lastMessage = chatContent.messages[chatContent.messages.length - 1]
                    if(lastMessage.seen === false){
                        
                        singleChatId = chatContent._id
                        // console.log(lastMessage.sender.username, lastMessage.sender.business, singleChatId)
                        io.to(socketId).emit('lastMessage', {lastMessage, singleChatId})
                        // lastMessages.push(lastMessage.message)
                    }
                }
               
            }
            getUserChats()
            
            
        }
        getUserData()
        
    })
    
    // Update messages' seen status to true
    socket.on('updateSeen', data =>{
        async function getMessages(){
            
            const chatContent = await Chat.findById(data).populate('messages')
            chatContent.messages.forEach(function(message){
                
                if(message.seen === false){
                    async function getMessageContent(){
                        const messageId = message._id
                        const messageContent = await Message.findByIdAndUpdate(messageId, {seen: true})
                        // const test = message.findOneAndUpdate({seen: false})
                        // console.log(messageContent)
                    }
                    getMessageContent()
                    
                }
            })
            
            
        }
        getMessages()
        
    })




})

// connect-mongo package
const store = MongoStore.create({
   
    mongoUrl: dbUrl,
    mongoOptions: {useUnifiedTopology: true},
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60,
})



store.on('error', function(e){
    console.log('Session error')
})

// Session
const sessionConfig = {
    store: store,
    name: 'NotDefaultSessionName',
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
// app.use(helmet())
// app.use(helmet({contentSecurityPolicy: false}))
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://ka-f.fontawesome.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    
];
const styleSrcUrls = [
    "https://use.fontawesome.com/",
    "https://kit.fontawesome.com/",
    // "https://fonts.gstatic.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com",
    
];
const connectSrcUrls = [
    "https://ka-f.fontawesome.com/"
]
const fontSrcUrls = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com/",
    "https://use.fontawesome.com/",
    "https://ka-f.fontawesome.com/"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", ...styleSrcUrls, "'unsafe-inline'"],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/chipi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
    helmet.referrerPolicy({
        policy: ["origin", "same-origin"],
    })
);








// Passport - Make sure it is after Session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.signupError = req.flash('signuperror')
    next();
});



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// app.use routes
app.use('/products', productsRoutes)
app.use('/products/:id/reviews', reviewsRoutes)
app.use('/', usersRoutes)
app.use('/', chatsRoutes)


// app.get('/', (req, res) =>{
//     res.render('home')
// })
// Controllers
// const productsController = require('/controllers/products')
const productsController = require('./controllers/products')

app.get('/', catchAsync(productsController.index))














// 404 - Error handlers

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page not found!', 404))
});


app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no something went wrong'
    res.status(statusCode).render('error', {err})
})

const port = 3000;
server.listen(port, ()=> {
    console.log(`Serving on port ${port}`)
})


