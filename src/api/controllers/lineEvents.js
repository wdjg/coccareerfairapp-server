import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');
const LineEvent = mongoose.model('LineEvent');

import response from './response.js';


// get /events
// query: user_id, employer_id, line_id, created_by, status
// future params: limit, sort
// by default sorted created_by desc
// ADMIN ONLY
function getLineEvents(req, res) {

    if (req.user.user_type !== 'admin') {
        res.status(401).json({
            "message": response.onlyAdmins
        });
    } else {

        LineEvent.find(req.query).sort({created_by: -1}).exec( function(err, events){
            if (err)
                return res.send(err);
            res.status(200).json({
                "events": events
            });
        });

    }

}


// get /events/auth
// query: user_id, employer_id, created_by, status
// future params: limit, sort
// by default sorted created_by desc.
function getLineEventsByAuthUser(req, res) {

    if (req.query.user_id && req.query.user_id !== req.user._id) {
        res.status(401).json({
            "message": response.getLineEventsByAuthUserUnauthorizedUserIdQuery
        });
    } else {
        var query = req.query;
        query.user_id = req.user._id; // make sure that its auth user.
        LineEvent.find(query).sort({created_by: -1}).exec(function (err, events) {
            if (err)
                return res.send(err);
            res.status(200).json({
                "events": events
            });
        });
    }

}

// get /events/:id
// :id is unique ObjectId of LineEvent.
// returns ONE LINEEVENT
function getLineEventById(req, res) {

    LineEvent.findById(req.params.id).exec(function (err, event) {
        if (err)
            return res.send(err);
        res.status(200).json(event);
    });

}

export default { getLineEvents, getLineEventsByAuthUser, getLineEventById }