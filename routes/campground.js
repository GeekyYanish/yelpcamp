const express = require('express');
const router = express.Router(); //this is to access the router func
const campgrounds = require('../controllers/campgrounds'); //This will imnport the controller campground
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware'); //middleware for authentication
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); //store in the storage from cloudinary

//For grouping '/' routes together
router
    .route('/')
    //this is a new request for viewing campgrounds
    .get(catchAsync(campgrounds.index)) //Here the index is a controller for rendering the index of the campground

    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send('IT WORKED');
    // });

    // this line is to send a post request to the server to add a new campground
    .post(
        isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground) //Here the createCampground is a controller creating/adding a new campground
    );

//this will create/add a new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm); //Here the renderNewForm is a controller to render the form for creating/adding a new campground

//For grouping '/:id' routes together
router
    .route('/:id')
    //this is to look up the campgrounds based on ID
    .get(
        catchAsync(campgrounds.showCampground) //Here the showCampground is a controller for showing the new campground
    )
    //This is the put method we used through method_Override even though we are using the Postmethod in the form (update route)
    .put(
        isLoggedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground) //Here the updateCampground is a controller for updating the campground
    )
    //This route is to delete the content in the campground, the post method will get overriden by delete
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //Here the deleteCampground is a controller for deleting the campground

//This is to edit the campground based on its ID
router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.editCampground) //Here the editCampground is a controller for editing the campground
);

module.exports = router;
