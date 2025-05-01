const { campgroundSchema, reviewSchema } = require('./schemas.js');
const expressError = require('./utils/ExpressError');
const campground = require('./models/campground'); //this is to access the campground model
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) =>{
    
    //if the request is not authenticated then go back to login page
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;  //store the requested URL in session
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// creates a new middleware function called storeReturnTo which is used to save the returnTo value from the session (req.session.returnTo) to res.locals:
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//middleware
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new expressError(msg, 400);
    } else {
        next();
    }
    // console.log(result);
};

//middleware to check the author id with the current user id
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campID = await campground.findById(id);
    //checks the author
    if (!campID.author.equals(req.user._id)) {
        req.flash('error', 'You are not the authorised user');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

//middleware to not let unauthorised user delete reviews
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    //checks the author
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You are not the authorised user');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};



//This middleware is to validate the reviews and check for errors
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new expressError(400, msg);
    } else {
        next();
    }
};