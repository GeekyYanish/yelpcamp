if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoSanitize = require('express-mongo-sanitize');

const express = require('express'); //to create express
const path = require('path'); //this is to create a path to the view
const mongoose = require('mongoose'); //this is to create mongoose
const ejsMate = require('ejs-mate'); //this is to install ejs
const methodOverride = require('method-override'); //this is to access the method override
const expressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const Helmet = require('helmet');

const userRoutes = require('./routes/user'); //This is to get the router
const campgroundRoutes = require('./routes/campground'); //This is to get the router
const reviewRoutes = require('./routes/review'); //This is to get the router

const MongoStore = require('connect-mongo');

//connection to atlas database
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
    //this it to connect mongoose for the database
});

const db = mongoose.connection; //this is to establish a connection between the database
//this line is to check if the connection fails, it throws an error message
db.on('error', console.error.bind(console, 'connection Error'));
//this line is to check if the connection is successful, it say "database connected"
db.once('open', () => {
    console.log('Database Connected');
});

const app = express(); //an onject to call express

app.engine('ejs', ejsMate); //this is to use the ejs-mate
app.set('view engine', 'ejs'); //this sets the view with ejs
app.set('views', path.join(__dirname, 'views')); //this sets the path and joins the ejs with js

// Express uses this middleware to parse the data and convert it into a JavaScript object, which makes it available in req.body
app.use(express.urlencoded({ extended: true }));

//Here we use the method override for using the HTTP method PUT and DELETE
app.use(methodOverride('_method'));

//This is to declare the public folder as static to serve static assets, wihtour having to go through all the folders
app.use(express.static(path.join(__dirname, 'public')));

//This is to sanitize the query
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //Turns into milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)); //This is to use the session

//this is to use the flash
app.use(flash());

app.use(Helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    Helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dycyryrg9/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//this is to configure the passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //This is to authenticate the passport local from the user model

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash (these are global)
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //this is to store the user details given by passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//route for creation of a new user

//Middleware for campground route
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

//request and response function
app.get('/', (req, res) => {
    res.render('home'); //this renders the home ejs form views
});

//this work on everywhere if the request is made to something non-exist
app.all(/(.*)/, (req, res, next) => {
    next(new expressError(404, 'Page Not Found')); //user defined message in error
});

//this middleware is to handle the errors(This is the next)
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh no something went wrong';
    res.status(status).render('error', { err }); // this is by default message
});

//this is to listen on the port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000');
});
