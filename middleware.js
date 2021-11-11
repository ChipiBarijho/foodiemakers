const {productSchema, reviewSchema, businessSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Product = require('./models/product');
const Review = require('./models/review')
const User = require('./models/user')

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        return res.redirect('/')
    }
    next();
}

module.exports.validateProduct = (req, res, next) => {
    const {error} = productSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}

module.exports.isAuthor = async (req, res, next) =>{
    const {id} = req.params;
    const product = await Product.findById(id);
    const s1 = product.author.toString()
    const s2 = req.user._id.toString()
    if (s1 !== s2) {
        // console.log('product.author:', product.author);
        // console.log('req.user._id:', req.user._id);
        return res.redirect(`/products/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) =>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    const s1 = review.author.toString()
    const s2 = req.user._id.toString()
    if (s1 == s2) {
        return next();
      
    } else {
        return res.redirect(`/products/${id}`)
    }
    
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}

module.exports.isProfileOwner = async (req, res, next) =>{
    const {id} = req.params;
    const user = await User.findById(id);
    const s1 = user._id.toString()
    const s2 = req.user._id.toString()
    if (s1 !== s2) {
        // console.log('product.author:', product.author);
        // console.log('req.user._id:', req.user._id);
        return res.redirect(`/profile/${id}`)
    }
    next();
}

module.exports.isBusinessOwner = async (req, res, next) =>{
    // const {id} = req.params;
    const id = req.user._id.toString()
    const user = await User.findById(id);
    
    if (user.business == ''){
        req.flash('error', 'Please set up your company details before selling a product')
        return res.redirect(`/profile/${id}`)
    }
    // if (s1 !== s2) {
    //     // console.log('product.author:', product.author);
    //     // console.log('req.user._id:', req.user._id);
    //     return res.redirect('/')
    // }
    next();
}

module.exports.validateBusiness = async (req, res, next) => {
    const {id} = req.params
    const name = req.body.business.name
    const check = await User.find({"business.name" : name});
    var checkBusinessName = ''
    if (check != ''){
        var checkBusinessName = check[0].business[0].name
    }
    
    const user = await User.findById(id)
    var currentBusinessName = ''
    if (user.business != ''){
        var currentBusinessName = user.business[0].name
    }
    if (checkBusinessName !== '' && checkBusinessName !== currentBusinessName){
        req.flash('error', 'Name already in use')
        return res.redirect(`/profile/${id}/business`)
    } 
    const {error} = businessSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else{
        next();
    }
}

module.exports.isChatOwner = async (req, res, next) =>{
    const {id} = req.params
    const {chats} = req.user
    // If the 'id' variable value matches any of the elements of the array 'chats' it is therefore truthy and calls next()
    if(chats.includes(id)){
        return next();
    }

    return res.redirect('/')
}