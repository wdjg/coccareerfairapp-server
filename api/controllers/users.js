var mongoose = require('mongoose');
var User = mongoose.model('User');
var Line = mongoose.model('Line');

// get /users
module.exports.getUserByAuthUser = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        User.findById(req.user._id).exec(function (err, user) {
            if (err)
                res.send(err);
            res.status(200).json(user)
        });
    }

};

// get /users/:id
module.exports.getUserById = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        User.findById(req.params.id).exec(function (err, user) {
            if (err)
                res.send(err);
            res.status(200).json(user)
        });
    }

};
