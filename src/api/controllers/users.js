import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');

import response from './response.js'

//get /users
function getUsers(req, res) {


    console.log('route called');
    /*if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    }*/
    if (notLoggedInSendRes(req, res)) {
        console.log('sent a 401');
        return;
    } else if (req.user.user_type !== 'admin') { // restricted to admin
        res.status(401).json({
            "message": response.getUsersOnlyAdmin
        });
    } else {
        User.find({ }).exec(function (err, users) {
            if (err)
                return res.send(err);
            res.status(200).json({
                "users": users
            });
        });
    }

}

// get /users/auth
function getUserByAuthUser(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        User.findById(req.user._id).exec(function (err, user) {
            if (err)
                return res.send(err);
            res.status(200).json(user);
        });
    }

}

// get /users/:id
function getUserById(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        User.findById(req.params.id).exec(function (err, user) {
            if (err)
                return res.send(err);
            res.status(200).json(user);
        });
    }

}

//patch /users/auth/data
function patchUserDataByAuthUser(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else if (!req.body.data) {
        res.status(400).json({
            "message": response.patchUsersMissingDataBody
        });
    } else {
        User.findById(req.user._id).exec(function (err, user){
            user.data = req.body.data;
            user.save( function(err, user) {
                if (err)
                    return res.send(err);
                res.status(200).json(user);
            });
        })
    }

}

//exported helper: check if user is logged in,
//and if not, send the response.
//returns a boolean
function notLoggedInSendRes(req, res) {
    console.log('check called');
    if (!req.user._id) {
        console.log('uh oh, not logged in');
        res.status(401).json({
            "message": response.unauthorized
        });
        return true;
    } else {
        console.log('everything is OK. they have an id');
        return false;
    }
}

export default { getUsers, getUserByAuthUser, getUserById, patchUserDataByAuthUser } 