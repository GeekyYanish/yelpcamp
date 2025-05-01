const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//passing the cloudinary variables given in the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//creating an object for CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp', //this is to specify where do we want the images to be uploaded
        allowedFormats: ['jpeg', 'png', 'jpg'] 
    }
});

module.exports = {
    cloudinary,
    storage
}