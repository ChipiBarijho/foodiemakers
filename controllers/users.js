const passport = require('passport')

// Models
const User = require('../models/user');
const Product = require('../models/product');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.renderLoginForm = (req, res) => {
    // console.log(req.user)
    if(req.user){
        return res.render('users/error/signedin')
    }
    res.render('users/login');
}


module.exports.createUser = async(req, res) => {
    const {username, email, password} = req.body;
    // Check if user and/or email already exists in database
    const checkUser = await User.find({username: username});
    const checkEmail = await User.find({email: email});
    
    // If user and email are available proceed with account creation
    if(checkUser == '' && checkEmail == ''){
        // Creates account in DB and uses passport methods
        const user = new User({email, username});
        const registeredUser = await User.register(user, password)
        // Automatically logs in user after registration
        req.login(registeredUser, err=>{
            if(err) return next(err);
            res.redirect('/')
        })
        return 
    } 

    // ERROR HANDLERS DURING SIGN UP
    // These error handlers verify that checkUser and checkEmail are not empty strings. If they are not empty strings it means that there was a match in the DB.
    
    // This one is in case there is a match in the DB for both username and email.
    if (checkUser != '' && checkEmail != ''){
        req.flash('signuperror', 'Username and Email are already in use')
        return res.redirect('/register')
    } 
    
    // This one is in case there is a match in the DB for a username
    if (checkUser != ''){
        req.flash('signuperror', 'Username not available')
        return res.redirect('/register')
    } 
    // This one is in case there is a match in the DB for an email
    if (checkEmail != ''){
        req.flash('signuperror', 'Email already in use')
        return res.redirect('/register')
    }
    
}

module.exports.renderRegisterBusinessForm = async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/registerbusiness', {user});
}

module.exports.createBusiness = async (req, res) => {
    const {id} = req.params
    const user = await User.findById(id);
    const {name, location, description} = req.body.business
    const business = await User.findByIdAndUpdate(id, {business: {name: name, location: location, description: description}})
    // user.business.push(business)
   
    await user.save()
    
    // console.log(name, location, description)
    res.redirect(`/profile/${id}`)
}

module.exports.showProfile = async (req, res) => {
    const user = await (await User.findById(req.params.id)).populate('business');
    const products = await Product.find({author: user._id}).populate('reviews');
    // console.log(products)
    res.render('users/profile', {user, products});
}


module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/'
    // const redirectUrl = req.headers.referer || '/products'
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res)=>{
    req.logout();
    res.redirect('/');
}