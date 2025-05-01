const express = require('express');
const router = express.Router();

const { storeReturnTo } = require('../middleware');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

//For grouping '/register' together
router
    .route('/register')
    .get(users.renderRegister)
    //This is the post request
    .post(catchAsync(users.register));

//For grouping '/login' together
router
    .route('/login')
    .get(users.renderLogin)
    //failureFlash will show flash and failureRedirect will redirect us to login if failed
    .post(
        // the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate('local', {
            failureFlash: true,
            failureRedirect: '/login',
        }),
        users.login
    );

//route for logging out
router.get('/logout', users.logout);

module.exports = router;
