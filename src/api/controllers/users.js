import mongoose from 'mongoose'
import { User, Student, Recruiter, Admin} from '../models/users.js'

const Line = mongoose.model('Line');

import response from './response.js'

//get /users
function getUsers(req, res) {

    if (req.user.user_type !== 'admin') { // restricted to admin
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
    
    User.findById(req.user._id).exec(function (err, user) {
        if (err)
            return res.send(err);
        res.status(200).json(user);
    });

}

// get /users/:id
function getUserById(req, res) {

    User.findById(req.params.id).exec(function (err, user) {
        if (err)
            return res.send(err);
        res.status(200).json(user);
    });

}

//patch /users/auth/profile
//you can only modify your own profile.
function patchProfileByAuthUser(req, res) {

    if (req.user.user_type === 'student') {

        try {
            return Student.findOneAndUpdate(
                { _id: req.user._id }, req.body, {new: true})
                .exec(function(err, student) {

                if (err) {
                    return res.status(500).json({
                        "message": err
                    });
                }

                return res.status(200).json(student);
            });
        } catch (err) {
            return res.status(500).json({
                "message": err
            });
        }
        
    } else if (req.user.user_type === 'recruiter') {

        try {
            return Recruiter.findOneAndUpdate(
                { _id: req.user._id }, req.body, {new: true})
                .exec(function(err, recruiter) {

                if (err) {
                    return res.status(500).json({
                        "message": err
                    });
                }

                return res.status(200).json(recruiter);
            });
        } catch (err) {
            return res.status(500).json({
                "message": err
            });
        }

    } else {
        return res.status(401).json({
            "message": response.profileNoAdmins
        });
    }
}

// GET /users/auth/favorites
// student only
function getFavoritesByAuthUser(req, res) {
    if (req.user.user_type !== 'student') {
        return res.status(403).json({
            "message": response.onlyStudent
        });
    } else {
        try {
            User.findById(req.user._id).populate('favorites').exec(function(err, user) {
                return res.status(200).json({
                    "favorites": user.favorites
                });
            });
        } catch (err) {
            return res.status(500).json({
                "message": err
            });
        }
    }
}

export default { getUsers, getUserByAuthUser, getUserById, patchProfileByAuthUser, getFavoritesByAuthUser } 