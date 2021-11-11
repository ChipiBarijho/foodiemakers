const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')

// Require models
const User = require('../models/user');

// Controller
const usersController = require('../controllers/users');
const { isLoggedIn, isProfileOwner, validateBusiness } = require('../middleware');


// Routers

router.route('/register')
    .get(usersController.renderRegisterForm)
    .post(catchAsync(usersController.createUser));


router.route('/login')
    .get(usersController.renderLoginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), usersController.login);


router.get('/profile/:id', usersController.showProfile)

router.route('/profile/:id/business')
    .get(isLoggedIn, isProfileOwner, usersController.renderRegisterBusinessForm)
    .put(isLoggedIn, isProfileOwner, validateBusiness, catchAsync(usersController.createBusiness));

router.get('/logout', usersController.logout)


module.exports = router;