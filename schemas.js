const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required().escapeHTML(),
        // images: Joi.object({
        //     url:  Joi.string().required(),
        //     filename:  Joi.string().required()
        // }).required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        category: Joi.string().valid('beverages', 'bakery', 'canned goods', 'dairy', 'dry goods', 'frozen foods', 'other', 'vacuum packaged').required()
    }).required(),
    deleteImages: Joi.array()
});



module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().escapeHTML()
    }).required()
});

module.exports.businessSchema = Joi.object({
    business: Joi.object({
        name: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().max(250).escapeHTML()
    }).required()
});