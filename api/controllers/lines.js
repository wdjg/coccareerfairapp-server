var mongoose = require('mongoose');
var User = mongoose.model('User');
var Line = mongoose.model('Line');

// get /lines
module.exports.getLineByAuthUser = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.findOne({user_id: req.user._id}).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json(line)
        });
    }

};

// get /lines/:id
module.exports.getLineById = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.findById(req.params._id).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json(line)
        });
    }

};

// post /lines
module.exports.createLine = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else if (!req.body.employer_id){
        res.status(400).json({
            "message": "InputError: Need to have employer_id defined"
        });
    } else {
        Line.findOne({user_id: req.user._id}).exec( function(err, line){
            //check if line already exists, only one line per student
            if (err)
                return res.send(err);

            if (line) {
                return res.status(400).json({
                    "message": "UniqueError: Line for this user already exists"
                });
            }
            //otherwise this is fine

            var line = Line();
            line.user_id = req.user._id
            line.employer_id = req.body.employer_id
            line.logEvent();
            line.save(function(err){
                if(err)
                    return res.send(err)
                res.status(200).json(line)
            });
        });
    }

};

// put /lines/:id
module.exports.updateLine = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        req.body.updated_by = new Date();
        Line.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true}).exec(function (err, line) {
            if (err)
                return res.send(err);
            line.logEvent();
            res.status(200).json(line);
        })
    }

};

// delete /lines/:id
module.exports.deleteLine = function (req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.remove({_id: req.params.id}).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json({
                "message": "Successfully deleted line"
            })
        })
    }

};