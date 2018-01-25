
var mongoose = require('mongoose');
var LineEvent = mongoose.model('LineEvent')

var lineSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    employer_id: {
        type: String,
        required: true
    },
    created_by: {
        type: Date,
        default: Date.now,
    },
    updated_by: {
        type: Date,
        default: Date.now,
    },
    finished_by: {
        type: Date,
        default: null,
    },
    status: {
        type: [{
            type: String,
            enum: ['preline', 'notification', 'inline', 'finishline', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn']
        }],
        default: 'preline'
    }
});

// create a LineEvent entry to keep track of history.
// should be called after every update event.
lineSchema.methods.logEvent = function() {
    console.log("Line: Logging line update event");
    var event = LineEvent();
    event.user_id = this.user_id;
    event.employer_id = this.employer_id;
    event.status = this.status;
    event.save(function(err) {
        if (err)
            return console.log("LineLogError: Unable to log line event: " + err);
    });
}
// update status of line
// used for manually updating status, instead of using api route
// also creates log event.
lineSchema.methods.updateStatus = function(status) {
    console.log("Line: Manually Updating Status: " + status);
    this.status = status;
    this.updated_by = new Date();
    this.save(function(err, line) {
        if (err)
            return console.log("LineUpdateError: " + err);
        
        line.logEvent();
    });
}

mongoose.model('Line', lineSchema);