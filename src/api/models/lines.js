import mongoose from 'mongoose'
import MongooseValidator from 'mongoose-validatorjs'
import idvalidator from 'mongoose-id-validator'
import LineEvent from './lineEvents.js'
const Schema = mongoose.Schema;

const BATCH_SIZE = 5;

var lineSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    employer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
        required: true,
        index: true
    },
    created_by: {
        type: Date,
        default: Date.now,
        index: true
    },
    updated_by: {
        type: Date,
        default: Date.now,
        index: true
    },
    finished_by: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['preline', 'notification', 'inline', 'startrecruiter', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn'],
        default: 'preline',
        index: true
    }
});

lineSchema.plugin(idvalidator);

// create a LineEvent entry to keep track of history.
// should be called after every update event.
// returns a promise (resolves to the line that logEvent() is called on)
lineSchema.methods.logEvent = async function() {
    console.log("Line: Logging line update event");
    var event = LineEvent();
    event.user_id = this.user_id;
    event.employer_id = this.employer_id;
    event.status = this.status;
    event.line_id = this._id;
    try {
        await event.save();
        return this;
    } catch (err) {
        console.log("LineLogError: Unable to log line event: " + err);
        return Promise.reject("LineLogError: Unable to log line event: " + err);
    }
}

// update status of line
// used for manually updating status, instead of using api route
// also creates log event.
// returns a promise: 'success' upon success, and an error message otherwise.
lineSchema.methods.updateStatus = async function(status) {
    var msg = null;
    //verify that line progression is happening in order
    //console.log('attempting to update line from %s to %s', this.status, status); //DEBUG
    switch (status) {

        case 'notification':
            if (this.status !== 'preline') {
                msg = "LineUpdateError: Cannot move to notification status from status " + this.status;
            }
            break;
        case 'inline':
            if (this.status !== 'notification' && this.status !== 'preline') {
                msg = "LineUpdateError: Cannot move to inline status from status " + this.status;
            }
            break;
        case 'startrecruiter':
            if (this.status !== 'inline') {
                msg = "LineUpdateError: Cannot move to startrecruiter status from status " + this.status;
            }
            break;
        case 'finishrecruiter':
            if (this.status !== 'startrecruiter') {
                msg = "LineUpdateError: Cannot move to finishrecruiter status from status " + this.status;
            }
            break;
        case 'timeoutchurn':
            if (this.status !== 'notification' && this.status !== 'inline' && this.status !== 'startrecruiter') {
                msg = "LineUpdateError: Cannot time out when in status " + this.status;
            }
            break;
        case 'preline':
            msg = "Cannot change status to preline - exit and reenter this line";
            break;
        case 'voluntarychurn':
            break; //can enter or exit at any time
        default:
            msg = "Invalid status desired: " + this.status;
            break;
    }

    if (msg !== null) {
        return Promise.reject(msg);
    }

    this.status = status;
    this.updated_by = new Date();
    //console.log('attempting to save line with new status %s', this.status); //DEBUG

    try {
        var newlySavedLine = await this.save();
        var newlyLoggedLine = await newlySavedLine.logEvent();

        switch (status) {
        case 'finishrecruiter':
        case 'timeoutchurn':
        case 'voluntarychurn':
            await newlyLoggedLine.remove();
            break;
        default:
            break;
        }
        return 'success';
    } catch (err) {
        console.log('updateStatus: error: ' + err);
        return Promise.reject('updateStatus: an error occurred: ' + err);
    }
}

lineSchema.statics.getBatchSize = function() {
    return BATCH_SIZE;
}

var Line = mongoose.model('Line', lineSchema);
module.exports = Line;