const express = require('express');
const router = express.Router();
// const catchAsync = require('../utils/catchAsync')

// Require models
// const Product = require('../models/product');

// Middleware
const {isLoggedIn, isChatOwner} = require('../middleware')

// Controllers
const chatsController = require('../controllers/chats')

// Routers
// router.route('/')
//     .get(catchAsync(productsController.index))
//     .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(productsController.createProduct));

router.get('/chat/:id', isLoggedIn, isChatOwner, chatsController.showChat)
router.post('/chats', chatsController.createChatRoom)



module.exports = router;