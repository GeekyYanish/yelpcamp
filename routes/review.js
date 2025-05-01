const express = require('express');
const router = express.Router({ mergeParams: true }); //this is to access the router func, as params are seperate in router, mergeParams joins the params
const catchAsync = require('../utils/catchAsync');
const campground = require('../models/campground'); //this is to access the campground model
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
//THis route is for submission of reviews
router.post(
    '/',
    validateReview,
    isLoggedIn,
    catchAsync(reviews.createReview) //This is controller to create review
);

//This is to delete the reviews
router.delete(
    '/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviews.deleteReview) //This is s controller to delete review
);

module.exports = router;
