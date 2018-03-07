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
        Line.findOne({user_id: req.user._id}).exec( async function(err, line){
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

            //console.log('attempting to save line'); //DEBUG
            try {
                await line.logEvent();
                var savedLine = await line.save();
                //console.log('before skipping, line status is %s', savedLine.status); //DEBUG
                var skippedLine = await skipAhead(savedLine);
                return res.status(200).json(skippedLine);
            } catch (err) {
                console.log('createLine: An error occurred: ' + err);
                return res.send(err);
            }

/*
            line.save(function(err){
                if(err)
                    return res.send(err)
                res.status(200).json(line)
            });*/
        });
    }

}

// helper for createLine: checks for skip ahead, and performs skip if appropriate.
async function skipAhead(line) {
    try {
        var curSize = await getSizeByEmployerId(line.employer_id);
        var batchSize = Line.getBatchSize();
        //console.log('current size is %s, batch max is %s', curSize, batchSize); //DEBUG
        if (curSize <= batchSize) {
            // active batch isn't full. Send them directly in line
            //console.log('So, attempting to skip ahead'); //DEBUG
            var statusMsg = await line.updateStatus("inline");
            if (statusMsg === 'success') {
                return line;
            } else {
                return Promise.reject(statusMsg);
            }
        } else {
            // active batch is already full. Just return, skipAhead's check is done.
            return line;
        } 
    } catch (err) {
        console.log('skipAhead: An error occurred');
        return Promise.reject("skipAhead: An error occurred: " + err);
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

// get /lines/auth/stats?employer_id=xxx
function getStatsByEmployerId(req, res) {
    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else {
        //use promises to have queries run async. in parallel.
        var size = getSizeByEmployerId(req.query.employer_id);
        var currentPlace = getMyPlaceByEmployerId(req.user._id, req.query.employer_id);

        Promise.all([size, currentPlace]).then(function(values) {
            //console.log('size = ' + values[0] + ', myPlace = ' + values[1]); //debug
            res.status(200).json({
                "size": values[0],
                "myPlace": values[1]
            });
        }).catch ( function(err) {
            res.send(err);
        })
    }
}

// get /lines/stats?employer_id=xxx
// UNAUTHENTICATED
function getStatsByEmployerIdNoAuth(req, res) {
    var size = getSizeByEmployerId(req.query.employer_id);
    
    //obviously Promise.all is overkill for only 1 statistic, but we plan to add more later anyway.
    Promise.all([size]).then(function(values) {
        //console.log('size = ' + values[0]); //debug
        res.status(200).json({
            "size": values[0]
        });
    }).catch ( function(err) {
        res.send(err);
    })
}

//helper: given employer_id, returns the # of users in line for that employer, as a promise.
function getSizeByEmployerId(employer_id) {
    //restrict line size count to people that are still waiting.
    //so, only preline, notification, and inline are counted.
    return Line.count({ employer_id: employer_id,
                        status: {$in: ["preline", "notification", "inline"] } }).exec();
}

//helper: given user_id and employer_id, returns what place this user is in line, as a promise.
function getMyPlaceByEmployerId(user_id, employer_id) {
    //to get current place:
    //check current status
    //then count # of lines with further advanced status
    //then also add # of lines with same status, but with older update timestamps.
    var myCurrentLine = Line.findOne({ user_id: user_id,
                                       employer_id: employer_id }).exec();
    return myCurrentLine.then(function (myLine) {
        if (!myLine) {
            return null; //you're not in line for this employer.
        }

        var status = myLine.status;
        switch (status) {
            case 'startrecruiter':
                return 0; //if you're already talking to the recruiter, you're at the front.
                break;

            case 'inline':
                var aheadOfMe = Line.count({ employer_id: employer_id,
                                    status: 'inline',
                                    updated_by: {$lt: myLine.updated_by}}).exec();
                return aheadOfMe.then(function (ahead) {
                    return ahead + 1;
                });
                break;

            case 'notification':
                //use exec() and Promise.all() to have queries run async. in parallel.
                var inlineCount = Line.count({ employer_id: employer_id,
                                               status: 'inline'}).exec();
                var notifCount = Line.count({ employer_id: employer_id,
                                              status: 'notification',
                                              updated_by: {$lt: myLine.updated_by}}).exec();
                return Promise.all([inlineCount, notifCount]).then(function(values) {
                    return values.reduce(function(a, b) { return a + b; } ) + 1;
                });
                break;

            case 'preline':
                const aheadStatuses = ['inline', 'notification'];
                var aheadCount = Line.count({ employer_id: employer_id,
                                              status: aheadStatuses}).exec();
                var prelineCount = Line.count({ employer_id: employer_id,
                                              status: 'preline',
                                              updated_by: {$lt: myLine.updated_by}}).exec();
                return Promise.all([aheadCount, prelineCount]).then(function(values) {
                    return values.reduce(function(a, b) {return a + b; } ) + 1;
                });
                break;

            default:
                return -1; //line exists, but you don't have a status that can really be considered in line.
                break;
        }
    });
}

// get /lines/users?employer_id=xxxxx
function getUsersByEmployerId(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": response.unauthorized
        });
    } else if (!req.query.employer_id) {
        res.status(401).json({
            "message": response.getLinesUsersMissingEmployerId
        });
    } else if (req.user.user_type === 'student'){
        res.status(401).json({
            "message": response.notStudent
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
        Line.findById({_id: req.params.id}).exec(async function (err, line) {
            if (err)
                return res.send(err);
            if (!line) {
                res.status(400).json({
                    "message": "No line found for parameter :id + " + req.params.id
                });
            } else {
                try {
                    var msg = await line.updateStatus(req.body.status);
                    res.status(200).json({
                          "message": "Successfully updated line with status " + req.body.status
                    });
                } catch (err) {
                    console.log(err);
                    res.status(400).json({
                        "message": err
                    });
                }
            }
        });
    }
}

export default { getLineByAuthUser, getLineById, createLine, updateLine, deleteLine, getStatsByEmployerId, getStatsByEmployerIdNoAuth, getUsersByEmployerId, updateLineStatus }
