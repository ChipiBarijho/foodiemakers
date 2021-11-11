const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage });

// Require models
const Product = require('../models/product');
const { findByIdAndUpdate } = require('../models/product');

// Middleware
const {isLoggedIn, isAuthor, validateProduct, isBusinessOwner} = require('../middleware')

// Controllers
const productsController = require('../controllers/products')

// Routers
// router.route('/')
//     .get(catchAsync(productsController.index))
//     .post(isLoggedIn, upload.array('image'), validateProduct, catchAsync(productsController.createProduct));


router.post('/', isLoggedIn, upload.array('image'), validateProduct, catchAsync(productsController.createProduct))

router.get('/search', catchAsync(productsController.searchProduct))
router.get('/categories/:category', productsController.categoryProduct)
router.get('/new', isLoggedIn, isBusinessOwner,productsController.renderNewForm);

router.route('/:id')
    .get(catchAsync(productsController.showProduct))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateProduct, catchAsync(productsController.updateProduct))
    .delete(isLoggedIn, isAuthor, catchAsync(productsController.deleteProduct));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(productsController.renderEditForm));



module.exports = router;