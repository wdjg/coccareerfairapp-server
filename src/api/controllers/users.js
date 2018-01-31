import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');

// get /users
function getUserByAuthUser(req, res) {

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

}

// get /users/:id
function getUserById(req, res) {

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

}

export default { getUserByAuthUser, getUserById } 