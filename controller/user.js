
const User = require("../models/user.js");

module.exports = {
    renderSignupForm: (req, res) => {
        res.render("users/signup");
    },

    signup: async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);

            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success", "Welcome to Airnub.");
                res.redirect("/listings");
            });
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/signup");
        }
    },

    renderLoginForm: (req, res) => {
        res.render("users/login");
    },

    login: (req, res) => {
        req.flash("success", "Welcome back!");
        const redirectUrl = req.session.redirectUrl || "/listings";
        delete req.session.redirectUrl;
        res.redirect(redirectUrl);
    },

    logOut: (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "You are logged out now!");
            res.redirect("/listings");
        });
    }
};