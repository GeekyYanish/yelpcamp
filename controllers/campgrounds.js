const Campground = require('../models/campground'); //this is to access the campground model
//It configures the MapTiler client with your API key.
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const { cloudinary } = require('../cloudinary');

//This is the index function to render the campground index page using controller
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds }); //index is the ejs and we are rendering campgrounds database
};

//This is the renderNewForm function to render a from to create/add the new campground using controller
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

//This is the createCampground function to add/create a new campground
module.exports.createCampground = async (req, res) => {

    //this code is using the MapTiler geocoding API to turn a location name (like a city or address) into geographic coordinates (latitude and longitude).
    const geoData = await maptilerClient.geocoding.forward(
        req.body.campground.location, //Takes a user-input location string. Uses MapTiler to get its coordinates.
        { limit: 1 }
    );

    // if (!req.body.campground)
    //     throw new expressEror('Invalid Campground Data', 400); //this throws error for an invalid request
    //catchAsync executes the module catchAsync in utils folder

    const campground = new Campground(req.body.campground); //This creates a new `Campground` object from the user input.
    campground.geometry = geoData.features[0].geometry; //Assigns the coordinates to the campground.
    campground.image = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`); //redirects to show ejs page
};

//This is the showCampground function to show newly added campgrounds
module.exports.showCampground = async (req, res) => {
    const campID = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: { path: 'author' },
        }) //the populate func here is used to add reviews using the ref concept and according to the ID; //this will store the ID
        .populate('author'); //the populate func here is used to add author
    if (!campID) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campID });
};

//This is the editCampground function to edit the campgrounds
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campID = await Campground.findById(id); //this will store the ID
    //checks the existence
    if (!campID) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campID });
};

//This is the updateCampground function to update the campgrounds
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const put_campID = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    }); //here we have used the spread operator '...'

    //this code is using the MapTiler geocoding API to turn a location name (like a city or address) into geographic coordinates (latitude and longitude).
    const geoData = await maptilerClient.geocoding.forward(
        req.body.campground.location,
        { limit: 1 }
    );
    put_campID.geometry = geoData.features[0].geometry;

    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    put_campID.image.push(...imgs); //we are adding/pushing the images onthe existing image
    await put_campID.save();
    if (req.body.deleteImages) {
        //This method is to delete the images from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //“From the document referenced by put_campID, remove all images where the filename is in the list req.body.deleteImages.”
        await put_campID.updateOne({
            $pull: { image: { filename: { $in: req.body.deleteImages } } },
        });
    }
    req.flash('success', 'Successfull updated');
    res.redirect(`/campgrounds/${put_campID._id}`); //redirects to show ejs page after editing/updating
};

//This is the deleteCampground function to delete the campgrounds
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
};
