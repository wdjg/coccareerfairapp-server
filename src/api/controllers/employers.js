import mongoose from 'mongoose'
import randomstring from 'randomstring'
const User = mongoose.model('User');
const Employer = mongoose.model('Employer');
const Line = mongoose.model('Line');

import response from './response.js'

// get employers/:id
function getEmployerById(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else {
        Employer.findById(req.params.id).exec(function (err, employer) {
            if (err)
                return res.send(err);
            res.status(200).json(employer);
        });
    }
};

// get /employers, also:
// get /employers?name=XXX
function getEmployerBySearch(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else if (!req.query.name) { //just return list of all employers
        Employer.find( { } ).exec(function (err, employers) {
            if (err)
                return res.send(err);
            res.status(200).json(employers);
        });
    } else {
        Employer.findOne({name: req.query.name}).exec(function (err, employer) {
            if (err)
                return res.send(err);
            res.status(200).json(employer);
        });
    }
};

// post employers
function createEmployer(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else if (!req.body.name) {
        res.status(400).json({
            "message": "InputError: Missing name parameter"
        });
    } else {
        var employer = Employer();
        employer.name = req.body.name
        employer.save(function(err){
            if(err)
                return res.send(err);
            res.status(200).json(employer);
        });
    }
};

// put employers/:id
function updateEmployer(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else {
        Employer.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true}).exec(function (err, employer) {
            if (err)
                return res.send(err);
            res.status(200).json(employer);
        })
    }
};

// delete employers/:id
function deleteEmployer(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else {
        Employer.remove({_id: req.params.id}).exec(function (err, employer) {
            if (err)
                res.send(err);
            res.status(200).json({
                "message": "Successfully deleted employer"
            })
        })
    }
};

// get /employers/:id/users
function getLineUsersById(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        var user_ids = [];
        var query = Line.find({ employer_id: req.params.id }).where({ status: "inline" }).sort({ updated_by: -1 })
        query.exec(function (err, lines) {
            if (err)
                return res.send(err);
            user_ids = lines.map(line => line.user_id);
            console.log(user_ids);
            console.log(lines);
        }).then(function () {
            User.find({ _id: user_ids }).exec(function (err, users) {
                if (err)
                    return res.send(err);
                res.status(200).json({
                    "users": users
                })
            });
        })
    }
}

// get /employers/:id/qr
function getQRCodeById(req, res) {
    console.log('test');
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else if (req.user.user_type == 'student') {
        req.status(401).json({
            "message": "UnauthorizedError: Not available to students"
        })
    } else {
        Employer.findById(req.params.id).exec( function (err, employer){
            if (err) {
                res.send(err);
            } else if (!employer) {
                res.status(404).json({
                    "message": "NotFoundError: No employer with this employer id"
                });
            } else {
                if (employer.qr_code_value) {
                    res.status(200).json(employer);
                } else { //qr code value doesn't exist yet; generate it & save to employer
                    employer.qr_code_value = randomstring.generate();
                    employer.save( function (err){
                        if (err)
                            return res.send(err);
                        res.status(200).json(employer);
                    });
                }
            }
        })
    }
};

// post /employers/qr
function getEmployerFromQRValue(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else if (!req.body.value) {
        res.status(400).json({
            "message": "InputError: Need value field!"
        });
    } else {
        const qr_value = req.body.value;
        Employer.findOne({ qr_code_value: qr_value }).exec( function (err, employer){
            if (err) {
                res.send(err);
            } else if (!employer) {
                res.status(404).json({
                    "message": "NotFoundError: No employer with this qr code value"
                });
            } else {
                //TODO: ask brian if sending whole employer back or just emp_id is better practice
                res.status(200).json(employer);
                /*res.status(200).json({
                    "employer_id": employer._id
                })*/
            }
        })
    }
};

export default { getEmployerById, getEmployerBySearch, createEmployer, updateEmployer, deleteEmployer, getLineUsersById, getQRCodeById, getEmployerFromQRValue}