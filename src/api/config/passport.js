import passport from 'passport'
import local from 'passport-local'
import mongoose from 'mongoose'
import response from '../controllers/response.js'

import { User, Student, Recruiter, Admin } from '../models/users.js'

passport.use(new local.Strategy({
    usernameField: 'email'
},
    async function (username, password, done) {
        var query = User.findOne({email: username});
        try {
            var user = await query.exec();
            switch (user.user_type) {
                case 'student':
                    query = Student.findOne({email: username}, ["+salt", "+hash"]);
                    break;
                case 'recruiter':
                    query = Recruiter.findOne({email: username}, ["+salt", "+hash"]);
                    break;
                case 'admin':
                    query = Admin.findOne({email: username}, ["+salt", "+hash"]);
                    break;
            }

            user = await query.exec();
        } catch (err) {
            return done(err);
        }
        
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
    }
));