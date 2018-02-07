import passport from 'passport'
import mongoose from 'mongoose'
import response from './response.js'
const User = mongoose.model('User');

function sendJSONresponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function register(req, res) {
    if(!req.body.name || !req.body.email || !req.body.password) {
      sendJSONresponse(res, 400, {
        "message": response.authRegisterMissingFields 
      });
      return;
    }

    User.findOne({email: req.body.email}).exec(function(err, user) {
        // if user is found, already exists
        if(user) {
            sendJSONresponse(res, 400, {
                "message": response.userAlreadyExists
            })
        } else {
            // user not found, make new one.
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save(function (err) {
                var token;
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token": token
                });
            });
        }
    });
};

function login(req, res) {

    if(!req.body.email || !req.body.password) {
      sendJSONresponse(res, 400, {
        "message": response.authLoginMissingFields
      });
      return;
    }

    passport.authenticate('local', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);

}

export default { register, login }