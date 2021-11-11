const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync')

// Middleware
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware')

// Controller
const reviewsController = require('../controllers/reviews')

// Router
router.post('/', isLoggedIn, validateReview, catchAsync(reviewsController.createReview));


router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewsController.deleteReview));


module.exports = router;