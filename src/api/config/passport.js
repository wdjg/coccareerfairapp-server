import passport from 'passport'
import local from 'passport-local'
import mongoose from 'mongoose'
import response from '../controllers/response.js'

var User = mongoose.model('User');

passport.use(new local.Strategy({
    usernameField: 'email'
},
    function (username, password, done) {
        User.findOne({ email: username }, ["+salt", "+hash"], function (err, user) {
            if (err) { return done(err); }
            // Return if user not found in database
            if (!user) {
                return done(null, false, {
                    message: response.authLoginNoUserFound
                });
            }
            // Return if password is wrong
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: response.authLoginInvalid
                });
            }
            // If credentials are correct, return the user object
            return done(null, user);
        });
    }
));