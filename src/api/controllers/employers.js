import mongoose from 'mongoose'
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
            "message": response.postEmployersMissingNameBody
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
                "message": response.success
            })
        })
    }
};

export default { getEmployerById, getEmployerBySearch, createEmployer, updateEmployer, deleteEmployer}