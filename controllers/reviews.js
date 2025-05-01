const campground = require('../models/campground'); //this is to access the campground model
const Review = require('../models/review');

//This function is to createReview
module.exports.createReview = async (req, res) => {
    const campReview = await campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campReview.reviews.push(review); //this is to add new reviews in the review array in campground Schema
    await review.save();
    await campReview.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campReview._id}`); //redirects to the same page
};

//This function is to delete a review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    }); //this is to pull the review based on the ID from the array
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted the review');
    res.redirect(`/campgrounds/${id}`);
};
