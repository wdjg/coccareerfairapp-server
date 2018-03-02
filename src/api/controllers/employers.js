import mongoose from 'mongoose'
const User = mongoose.model('User');
const Employer = mongoose.model('Employer');
const Line = mongoose.model('Line');

import response from './response.js'

// get /employers/auth
// RECRUITERS ONLY
function getEmployerByAuthUser(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else if (req.user.user_type !== 'recruiter') {
        res.status(401).json({
            "message": response.onlyRecruiters
        });
    } else {
        User.findById(req.user._id).exec( function(err, user){
            if (err)
                return res.send(err);
            Employer.findById(user.employer_id).exec( function(err, employer){
                if (err)
                    return res.send(err);
                res.status(200).json(employer);
            });
        });

    }
}

// get /employers/:id
// UNAUTHENTICATED ROUTE
function getEmployerById(req, res) {
    Employer.findById(req.params.id).exec(function (err, employer) {
        if (err)
            return res.send(err);
        res.status(200).json(employer);
    });
};

// get /employers, also:
// get /employers?name=XXX
// UNAUTHENTICATED ROUTE
function getEmployerBySearch(req, res) {
    if (!req.query.name) { //just return list of all employers
        Employer.find( { } ).exec(function (err, employers) {
            if (err)
                return res.send(err);
            res.status(200).json({
                "employers": employers
            });
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

// patch employers/auth/data
function patchEmployersDataByAuthUser(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized 
        });
    } else if (req.user.user_type !== 'recruiter') {
        res.status(401).json({
            "message": response.onlyRecruiters
        });
    } else if (!req.body.data) {
        res.status(400).json({
            "message": response.patchEmployersMissingDataBody 
        });
    } else {
        User.findById(req.user._id).exec( function(err, user){
            if (err)
                return res.send(err);
            Employer.findById(user.employer_id).exec( function(err, employer){
                employer.data = req.body.data;
                employer.save( function(err, employer){
                    if (err)
                        return res.send(err);
                    res.status(200).json(employer);
                });
            });
        });
    }
};

export default { getEmployerBySearch, getEmployerByAuthUser, getEmployerById, createEmployer, updateEmployer, deleteEmployer, patchEmployersDataByAuthUser }

