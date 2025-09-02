
const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const userController = require("../controller/user.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.route("/signup")
.get( userController.renderSignupForm)
.post(wrapAsync( userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(
    passport.authenticate("local", { 
        failureRedirect: "/login",   
        failureFlash: true,          
    }),
    userController.login 
);

// Logout route
router.get("/logout", userController.logOut);

module.exports = router;