const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ 
    cloud_name: 'chipi', 
    api_key: '977552345233317', 
    api_secret: 'fkseTVORQ3sYas0T7kIQ1OGWnX8' 
  });

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'FoodieMakers',
        allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'jfif']
    }
});

module.exports = {
    cloudinary,
    storage
}