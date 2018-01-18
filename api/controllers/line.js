var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.getLineByUser = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.findOne({user_id: req.payload._id}).exec(function (err, line) {
            if (err)
                res.send(err);
            res.status(200).json(line)
        });
    }

};

module.exports.getLineById = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.findById(req.params._id).exec(function (err, line) {
            if (err)
                res.send(err);
            res.status(200).json(line)
        });
    }

};

module.exports.createLine = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        var line = Line();
        line.user_id = req.payload._id
        line.logEvent();
        line.save()
    }

};

module.exports.updateLine = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.findByIdAndUpdate({_id: req.params.id}, req.body).exec(function (err, line) {
            if (err)
                res.send(err);
            line.logEvent();
            res.status(200).json(line);
        })
    }

};

module.exports.deleteLine = function (req, res) {

    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
    } else {
        Line.remove({_id: req.params.id}).exec(function (err, line) {
            if (err)
                res.send(err);
            res.status(200).json({
                "message": "Successfully deleted line"
            })
        })
    }

};