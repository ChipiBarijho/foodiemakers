// Models
const Product = require('../models/product');

// Packages
const {cloudinary} = require('../cloudinary');
const product = require('../models/product');





module.exports.index = async (req, res) => {
    const products = await Product.find({}).populate('reviews');
    const allRatedProducts = []
    products.forEach(function(product){
        let ratings = []
        let obj = {};
        // console.log(product.reviews.length)
        product.reviews.forEach(function(review){
            ratings.push(review.rating)
            // console.log(product)
            obj['id'] = product._id
            obj['title'] = product.title
            obj['category'] = product.category
            obj['price'] = product.price
            obj['image'] = product.images[0].url
        })
        const sum = ratings.reduce((partial_sum, a) => partial_sum + a,0);
        if(product.reviews != ''){
            // console.log(sum / product.reviews.length);
            obj['finalRating'] = sum / product.reviews.length;
        } 
        obj['totalReviews'] = product.reviews.length
        allRatedProducts.push(obj)
    })
    
    const topRated = (arr, n) => {
        if(n > arr.length){
           return false;
        }
        const arr2 = []
        arr.forEach(function(product){
            if(product.totalReviews >= 10){
                arr2.push(product)
            }
        })
        return arr2
        .slice()
        .sort((a, b) => {
           return b.finalRating - a.finalRating
        })
        .slice(0, n);
    };

    const topOtherRated = (arr, n) => {
        if(n > arr.length){
           return false;
        }
        const arr2 = []
        arr.forEach(function(product){
            if(product.category === 'other'){
                arr2.push(product)
            }
        })
        return arr2
        .slice()
        .sort((a, b) => {
           return b.finalRating - a.finalRating
        })
        .slice(0, n);
    };
    const topBeveragesRated = (arr, n) => {
        if(n > arr.length){
           return false;
        }
        const arr2 = []
        arr.forEach(function(product){
            if(product.category === 'beverages'){
                
                arr2.push(product)
            }
        })
        return arr2
        .slice()
        .sort((a, b) => {
           return b.finalRating - a.finalRating
        })
        .slice(0, n);
    };
    const topDryGoodsRated = (arr, n) => {
        if(n > arr.length){
           return false;
        }
        const arr2 = []
        arr.forEach(function(product){
            if(product.category === 'dry goods'){
                arr2.push(product)
            }
        })
        return arr2
        .slice()
        .sort((a, b) => {
           return b.finalRating - a.finalRating
        })
        .slice(0, n);
    };

    const topDairyRated = (arr, n) => {
        if(n > arr.length){
           return false;
        }
        const arr2 = []
        arr.forEach(function(product){
            if(product.category === 'dairy'){
                arr2.push(product)
            }
        })
        return arr2
        .slice()
        .sort((a, b) => {
           return b.finalRating - a.finalRating
        })
        .slice(0, n);
    };


    const bestRatedProducts = (topRated(allRatedProducts, 3))
    const bestOther = (topOtherRated(allRatedProducts, 2))
    const bestBeverages = (topBeveragesRated(allRatedProducts, 1))
    const bestDryGoods = (topDryGoodsRated(allRatedProducts, 1))
    const bestDairy = (topDairyRated(allRatedProducts, 1))
    // console.log(bestDryGoods, bestBeverages, bestDairy);

    res.render('home', { products, bestRatedProducts, bestOther, bestBeverages, bestDryGoods, bestDairy })
}

module.exports.renderNewForm = (req, res) => {
    res.render('products/new')
}

module.exports.createProduct = async (req, res) => {
    const product = new Product(req.body.product)
    product.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    product.author = req.user._id
    await product.save()
    req.flash('success', 'Product listed succesfully!')
    res.redirect(`/products/${product._id}`)    
}

module.exports.showProduct = async (req, res) => {
    const product = await (await Product.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'))

    if(!product){
        req.flash('error', 'Product does not exist :(' )
        return res.render('products/error/notfound')
    }
    // product.reviews.forEach(function(review){
    //     console.log(review.author.username)
    // })
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    res.render('products/show', { product, page, startIndex, endIndex, limit })
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const product = await Product.findById(id)
    res.render('products/edit', { product })
}

module.exports.updateProduct = async (req, res) => {
    const {id} = req.params;
    // console.log(req.body)
    const product = await Product.findByIdAndUpdate(id, {...req.body.product})
    imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    product.images.push(...imgs);
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        // console.log(product)
    }
    await product.save()
    req.flash('success', 'Product update succesfully')
    res.redirect(`/products/${product._id}`)   
}

module.exports.deleteProduct = async (req, res) => {
    const {id} = req.params;
    await Product.findByIdAndDelete(id)
    req.flash('success', 'Your product has been succesfully deleted')
    res.redirect('/products')
}

module.exports.searchProduct = async (req, res) => {
    const {search} = req.query;
 
    const result = await Product.find({"title" :{ $regex: search, $options: "i"}}).populate('reviews');
    
    res.render('products/search', {result, search})
}

module.exports.categoryProduct = async (req, res) => {
    const {category} = req.params;
    const products = await Product.find({category: category}).populate('reviews');
    if(products == ''){
        return res.redirect('/')
    }
    

    res.render('products/categories/category', {products, category})
}