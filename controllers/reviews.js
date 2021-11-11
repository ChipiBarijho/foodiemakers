// Require models
const Product = require('../models/product');
const Review = require('../models/review')
const { findByIdAndUpdate } = require('../models/review');



module.exports.createReview = async(req, res) => {
    const product = await Product.findById(req.params.id);
    // const review = new Review(req.body.review);
    const {rating, body} = req.body.review
    const review = new Review({body: body, rating: rating});
    review.author = req.user._id
    product.reviews.push(review);
    await review.save();
    await product.save();
    res.redirect(`/products/${product._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    
    // mongo's pull operator -- id(product id) then $pull then choose array from model in this case reviews: and then get the single review id which is reviewId from req.params
    await Product.findByIdAndUpdate(id,{ $pull: {reviews: reviewId}});

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/products/${id}`)
}