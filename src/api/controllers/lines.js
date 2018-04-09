import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');
const LineEvent = mongoose.model('LineEvent');

const MS_IN_ONE_DAY = 86400000;
const MS_IN_ONE_MIN = 60000;

import response from './response.js';


// get /lines
// default sorted by most recent.
// ADMIN ONLY
function getLinesBySearch(req, res) {
    if (req.user.user_type !== 'admin') {
        res.status(401).json({
            "message": response.onlyAdmins
        });
    } else {
        Line.find(req.query).sort({updated_by: -1}).exec(function (err, lines){
            if (err)
                return res.send(err);
            res.status(200).json({
                "lines": lines
            });
        });
    }
}

// get /lines/auth
function getLineByAuthUser(req, res) {
    Line.find( { user_id: req.user._id } ).exec(function (err, lines) {
        if (err)
            return res.send(err);
        res.status(200).json({
            "lines": lines
        });
    });
}

// get /lines/:id
function getLineById(req, res) {

    Line.findById(req.params.id).exec(function (err, line) {
        if (err)
            return res.send(err);
        res.status(200).json(line);
    });

}

// post /lines
function createLine(req, res) {

    if (req.user.user_type !== 'student') {
        res.status(401).json({
            "message": response.onlyStudent
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
            // active batch is not full. Send them directly in line
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

    if (req.user.user_type == 'student') {
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

    Line.remove({_id: req.params.id}).exec(function (err, removedInfo) {
        if (err)
            return res.send(err);
        let numRemoved = removedInfo.result.n; //remove() returns a promise with some info, but not a line itself
        if (numRemoved > 0) {
            return res.status(200).json({
                "message": response.deleteSuccess(numRemoved)
            });
        } else {
            return res.status(404).json({
                "message": response.deleteNotFound
            });
        }

    })

}

// get /lines/auth/stats?employer_id=xxx
function getStatsByEmployerId(req, res) {

    if (!req.query.employer_id) {
        return res.status(400).json({
            "message": response.getLineStatsMissingEmployerId
        });
    }

    //use promises to have queries run async. in parallel.
    var size = getSizeByEmployerId(req.query.employer_id)
    var currentPlace = getMyPlaceByEmployerId(req.user._id, req.query.employer_id)
    var avgWait = getAverageWaitTimeByEmployerId(req.query.employer_id)

    Promise.all([size, currentPlace, avgWait]).then(function(values) {
        //console.log('size = ' + values[0] + ', myPlace = ' + values[1]); //debug
        res.status(200).json({
            "size": values[0],
            "myPlace": values[1],
            "averageWaitMinutes": values[2]
        });
    }).catch ( function(err) {
        res.send(err);
    })
}

// get /lines/stats?employer_id=xxx
// UNAUTHENTICATED
function getStatsByEmployerIdNoAuth(req, res) {

    if (!req.query.employer_id) {
        return res.status(400).json({
            "message": response.getLineStatsMissingEmployerId
        });
    }

    var size = getSizeByEmployerId(req.query.employer_id);
    var avgWait = getAverageWaitTimeByEmployerId(req.query.employer_id);

    Promise.all([size, avgWait]).then(function(values) {
        //console.log('size = ' + values[0]); //debug
        res.status(200).json({
            "size": values[0],
            "averageWaitMinutes": values[1]
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
            return null; //you are not in line for this employer.
        }

        var status = myLine.status;
        switch (status) {
            case 'startrecruiter':
                return 0; //if you are already talking to the recruiter, you are at the front.
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
                return -1; //line exists, but you do not have a status that can really be considered in line.
                break;
        }
    });
}

//helper: given employer_id, calculates the average wait time that has happened so far.
//returns time in # of minutes (rounded up).
function getAverageWaitTimeByEmployerId(emp_id) {
    //get all line events for this employer from the past 24 hours.
    //sort them by user_id, then by time of event.
    var yesterday = new Date() - MS_IN_ONE_DAY;

    var todaysEvents = LineEvent.find({ employer_id: emp_id,
                                        created_by: {$gt: yesterday}})
                                        .sort({ user_id: -1, created_by: -1})
                                        .exec();

    return todaysEvents.then(function (lineEvents) {
        //make a pass through that checks for corresponding startrecruiter/preline events from the same user_id.
        var SRTimeMap = {};
        var PLTimeMap = {};

        for (var i = 0; i < lineEvents.length; i++) {
            let thisEvent = lineEvents[i];
            //console.log("checking out event: " + thisEvent); //debug
            if (thisEvent.status === 'startrecruiter') {
                if (!(thisEvent.user_id in SRTimeMap)) { //not sure if this check is actually necessary
                    SRTimeMap[thisEvent.user_id] = thisEvent.created_by;
                }
                continue;
            } else if (thisEvent.status === 'preline') {
                //array should be sorted in descending time order, so make sure there's a corresponding SR entry.
                if (thisEvent.user_id in SRTimeMap) {
                    //make sure there is not a PL entry - if there is, then this is an older event when they entered the line,
                    //but subsequently left (for whatever reason), which we want to ignore.
                    if (!(thisEvent.user_id in PLTimeMap)) {
                        PLTimeMap[thisEvent.user_id] = thisEvent.created_by;
                    }
                }
            }
        }

        //now, iterate through PLTimeMap (if a uID is here, it's also in SRTimeMap).
        //subtract preline time from startrecruiter time for each user_id.
        //keep a rolling sum & count of wait times.
        var count = 0;
        var totalWaitInMS = 0;

        for (var userID in PLTimeMap) {
            count++;
            let userWait = SRTimeMap[userID] - PLTimeMap[userID];
            totalWaitInMS += userWait;
        }

        if (count === 0) {
            return -1; //signal value that means no users have completed their wait in line yet.
        }

        //divide to get average.
        let avgWaitInMS = totalWaitInMS / count;

        //convert to minutes & round up.
        let avgWaitInMinutes = Math.ceil(avgWaitInMS / MS_IN_ONE_MIN);
        //DEBUG
        /*console.log('total users logged: ' + count);
        console.log('total wait time in MS: ' + totalWaitInMS);
        console.log('avg wait time in MS: ' + avgWaitInMS);
        console.log('avgWaitInMinutes: ' + avgWaitInMinutes);*/
        return avgWaitInMinutes;
    });
}

// get /lines/users?employer_id=xxxxx
// get /lines/users
function getUsersByEmployerId(req, res) {
    //if auth user is a recruiter, their emp_id is used (ignore query; recruiters can only see their own batch)
    //else, use query parameter.
    //if query blank and auth user is not a recruiter, not allowed.

    if (req.user.user_type === 'student'){
        return res.status(401).json({
            "message": response.notStudent
        });
    }

    let emp_id;
    if (req.user.user_type === 'recruiter') {
        emp_id = req.user.employer_id;
    } else if (req.query.employer_id) {
        emp_id = req.query.employer_id;
    } else {
        return res.status(401).json({
            "message": response.getLinesUsersMissingEmployerId
        });
    }

    var user_ids = [];
    var userIdsToLineIds = {};
    var query = Line.find({ employer_id: emp_id }).where({ status: "inline" }).sort({ updated_by: -1 });

    return query.exec(function (err, lines) {
        if (err)
            return res.send(err);

        lines.forEach(function(line) {
            user_ids.push(line.user_id);
            userIdsToLineIds[line.user_id] = line._id;
        });

    }).then(function () {
        User.find({ _id: user_ids })
            .lean()
            //lean() is used so that we get a plain object back that we can modify before sending to the client.
            //In this case we want to add the line_id
            .exec(function (err, users) {

            if (err)
                return res.send(err);

            //We do not know what order the users are returned in,
            //but we need to match them to the corresponding line_ids.
            for (var i = 0; i < users.length; i++) {
                users[i].line_id = userIdsToLineIds[users[i]._id];
            }

            return res.status(200).json({
                "users": users
            })
        });
    })
}

/*//get /lines/auth/users
function getUsersByAuthEmployerId(req, res) {
    if (req.user.user_type !== 'recruiter') {
        return res.status(401).json({
            "message": response.onlyRecruiters
        });
    }

    return getUsersByEmployerId(req, res, req.user.employer_id);
}*/

// patch /lines/:id/status
// currently, only the status field is mutable this way
function updateLineStatus(req, res) {
    if (((req.body.status === 'startrecruiter') || (req.body.status === 'finishrecruiter')) && ((req.user.user_type !== 'recruiter') && (req.user.user_type !== 'admin'))) {
        return res.status(401).json({
            "message": response.onlyRecAdmins
        });
    } else if (((req.body.status === 'preline') || (req.body.status === 'inline')) && (req.user.user_type !== 'student')) {
        return res.status(401).json({
            "message": response.onlyStudent
        });
    }
    Line.findById({_id: req.params.id}).exec(async function (err, line) {
        if (err)
            return res.send(err);
        if (!line) {
            return res.status(400).json({
                "message": "No line found for parameter :id + " + req.params.id
            });
        }
        try {
            var msg = await line.updateStatus(req.body.status);
            return res.status(200).json({
                "message": "Successfully updated line with status " + req.body.status
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                "message": err
            });
        }
    });

}

export default { getLinesBySearch, getLineByAuthUser, getLineById, createLine, updateLine, deleteLine, getStatsByEmployerId, getStatsByEmployerIdNoAuth, getUsersByEmployerId, updateLineStatus }
