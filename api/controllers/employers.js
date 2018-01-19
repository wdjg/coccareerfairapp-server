var mongoose = require('mongoose');
var Employer = mongoose.model('Employer');

// get employers/:id
module.exports.getEmployerById = function (req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Employer.findById(req.params.id).exec(function (err, employer) {
            if (err)
                res.send(err);
            res.status(200).json(employer);
        });
    }
};

// get employers?name=XXX
module.exports.getEmployerBySearch = function (req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else if (!req.query.name) {
        res.status(401).json({
            "message": "InputError: Missing name parameter"
        });
    } else {
        Employer.findOne({name: req.query.name}).exec(function (err, employer) {
            if (err)
                res.send(err);
            res.status(200).json(employer);
        });
    }
};

// post employers
module.exports.createEmployer = function (req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else if (!req.body.name) {
        res.status(401).json({
            "message": "InputError: Missing name parameter"
        });
    } else {
        var employer = Employer();
        employer.name = req.body.name
        employer.save(function(err){
            if(err)
                res.send(err);
            res.status(200).json(employer);
        });
    }
};

// put employers/:id
module.exports.updateEmployer = function (req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Employer.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true}).exec(function (err, employer) {
            if (err)
                res.send(err);
            res.status(200).json(employer);
        })
    }
};

// delete employers/:id
module.exports.deleteEmployer = function (req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
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