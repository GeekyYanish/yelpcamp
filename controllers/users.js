const User = require('../models/user');

//This is a function to render the login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

//This is a funciton to make sure the user is logged in
module.exports.login = (req, res) => {
    // Now we can use res.locals.returnTo to redirect the user after login
    req.flash('success', 'welcome Back');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

//This is a function to render the register form
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

//This function is to register the user
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        //callback function, this function gives the login details to req.user when registering without needing to login again to register the session
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'welcome to yelpcamp');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

//This function is to logout
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};
