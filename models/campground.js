const mongoose = require('mongoose'); //this is to create mongoose
const Schema = mongoose.Schema; //this is to create schema
const Review = require('./review');

//schema for storing the url for images
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//This line of code is for displaying the thumbnail by storing the url of the image
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

//This is 
const opts = { toJSON: { virtuals: true } };
//this is a schema where we used object of schema
const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});


//this is to delete the campground along with review
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews,
            },
        });
    }
});

module.exports = mongoose.model('campground', campgroundSchema); //this is to export it to the main file ('name_of_model', name_of_Schema)
