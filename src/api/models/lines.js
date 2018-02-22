import mongoose from 'mongoose'
import MongooseValidator from 'mongoose-validatorjs'
import idvalidator from 'mongoose-id-validator'
const Schema = mongoose.Schema;
const LineEvent = mongoose.model('LineEvent')

var lineSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
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
        type: String,
        enum: ['preline', 'notification', 'inline', 'startrecruiter', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn'],
        default: 'preline'
    }
});

lineSchema.plugin(idvalidator);

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
// returns 'success' upon success, and an error message otherwise.
lineSchema.methods.updateStatus = function(status) {
    var msg = null;
    //verify that line progression is happening in order
    switch (status) {

        case 'notification':
            if (this.status !== 'preline') {
                msg = "LineUpdateError: Cannot move to notification status from status " + status;
            }
            break;
        case 'inline':
            if (this.status !== 'notification') {
                msg = "LineUpdateError: Cannot move to inline status from status " + status;
            }
            break;
        case 'startrecruiter':
            if (this.status !== 'inline') {
                msg = "LineUpdateError: Cannot move to startrecruiter status from status " + status;
            }
            break;
        case 'finishrecruiter':
            if (this.status !== 'startrecruiter') {
                msg = "LineUpdateError: Cannot move to finishrecruiter status from status " + status;
            }
            break;
        case 'timeoutchurn':
            if (this.status !== 'notification' && this.status !== 'inline' && this.status !== 'startrecruiter') {
                msg = "LineUpdateError: Cannot time out when in status " + status;
            }
            break;
        case 'preline':
            msg = "Cannot change status to preline - exit and reenter this line";
            break;
        case 'voluntarychurn':
            break; //can enter or exit at any time
        default:
            msg = "Invalid status desired: " + status;
            break;
    }

    if (msg !== null) {
        return msg;
    }

    this.status = status;
    this.updated_by = new Date();
    this.save(function(err, line) {
        if (err)
            console.log("LineUpdateError: " + err);
            return "LineUpdateError: " + err;
        
        line.logEvent();
    });

    //delete if in end state
    switch (status) {
        case 'finishrecruiter':
        case 'timeoutchurn':
        case 'voluntarychurn':
            this.remove(function(err) {
                if (err) {
                    console.log("LineUpdateError: Could not remove line: " + err);
                    return 'LineUpdateError: Could not remove line: ' + err;
                }
            });
            break;
        default:
            break;
    }

    msg = 'success';
    return msg;
}

mongoose.model('Line', lineSchema);