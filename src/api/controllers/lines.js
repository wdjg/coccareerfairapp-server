import mongoose from 'mongoose'
const User = mongoose.model('User');
const Line = mongoose.model('Line');

// get /lines
function getLineByAuthUser(req, res) {

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

}

// get /lines/:id
function getLineById(req, res) {

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

}

// post /lines
function createLine(req, res) {

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

}

// put /lines/:id
function updateLine(req, res) {

    if (!req.user._id) {
        res.status(401).json({
            "message": "UnauthorizedError: Need to be logged in"
        });
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

}

export default { getLineByAuthUser, getLineById, createLine, updateLine, deleteLine }