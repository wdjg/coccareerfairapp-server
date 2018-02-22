import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');

import response from './response.js';

// get /lines
function getLineByAuthUser(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        Line.findOne({user_id: req.user._id}).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json(line);
        });
    }

}

// get /lines/:id
function getLineById(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        Line.findById(req.params.id).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json(line);
        });
    }

}

// post /lines
function createLine(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        Line.findOne({user_id: req.user._id}).exec( function(err, line){
            //check if line already exists, only one line per student
            if (err)
                return res.send(err);

            if (line) {
                return res.status(400).json({
                    "message": response.postLinesAlreadyExists
                });
            }
            //otherwise this is fine

            var line = Line();
            line.user_id = req.user._id;
            line.employer_id = req.body.employer_id;
            line.status = 'preline';
            line.logEvent();
            line.save(function(err){
                if(err)
                    return res.send(err)
                res.status(200).json(line)
            });
        });
    }

}

// put /lines/:id
function updateLine(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else if (req.user.user_type == 'student') {
        req.status(401).json({
            "message": response.authNoStudentsAllowed
        })
    } else {
        req.body.updated_by = new Date();
        Line.findByIdAndUpdate({_id: req.params.id}, req.body, {new: true}).exec(function (err, line) {
            if (err)
                return res.send(err);
            if (line) {
                line.logEvent();
                res.status(200).json(line);
            } else {
                res.status(400).json({
                    "message": "No line found for parameter :id + " + req.params.id
                })
            }
        })
    }

}

// delete /lines/:id
function deleteLine(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        Line.remove({_id: req.params.id}).exec(function (err, line) {
            if (err)
                return res.send(err);
            res.status(200).json({
                "message": response.success
            })
        })
    }

}

// get /lines/stats/?employer_id=xxx
function getStatsByEmployerId(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        // restrict to only preline, notification, and inline.
        const statuses = ['preline','notification','inline'];
        Line.count({ employer_id: req.query.employer_id }).where("status").in(statuses).exec(function (err, count) {
            if (err) {
                return res.send(err);
            }
            res.status(200).json({
                "size": count
            });
        });
    }
}

// get /lines/users?employer_id=xxxxx
function getUsersByEmployerId(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else if (!req.query.employer_id) {
        res.status(401).json({
            "message": response.getLinesUsersMissingEmployeId
        });
    } else {
        var user_ids = [];
        var query = Line.find({ employer_id: req.query.employer_id }).where({ status: "inline" }).sort({ updated_by: -1 })
        query.exec(function (err, lines) {
            if (err)
                return res.send(err);
            user_ids = lines.map(line => line.user_id);
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


// patch /lines/:id/status
// currently, only the status field is mutable this way
function updateLineStatus(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else { 
        Line.findById({_id: req.params.id}).exec(function (err, line) {
            if (err) 
                return res.send(err);
            if (!line) {
                res.status(400).json({
                    "message": "No line found for parameter :id + " + req.params.id
                });
            } else {
                const msg = line.updateStatus(req.body.status);

                if (msg !== 'success') {
                    res.status(400).json({
                        "message": msg
                    });
                } else {
                    res.status(200).json({
                        "message": "Successfully updated line with status " + req.body.status
                    });
                }
            }      
        });
    }
}

export default { getLineByAuthUser, getLineById, createLine, updateLine, deleteLine, getStatsByEmployerId, getUsersByEmployerId, updateLineStatus }

