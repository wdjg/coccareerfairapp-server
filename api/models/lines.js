
var mongoose = require('mongoose');
var LineEvent = mongoose.model('LineEvent')

var lineSchema = new mongoose.Schema({
    user_id: {
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
            enum: ['preline', 'notification', 'accepted', 'inline', 'finishline', 'finishrecruiter']
        }],
        default: ['preline']
    }
});



lineSchema.methods.logEvent = function () {
    console.log("Logging line update event,");
    var event = LineEvent();
    event.user_id = this.user_id;
    event.status = this.status;
    event.save();
}

mongoose.model('Line', lineSchema);