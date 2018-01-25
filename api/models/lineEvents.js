var mongoose = require('mongoose');
var lineEventSchema = new mongoose.Schema({
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
    status: {
        type: [{
            type: String,
            enum: ['preline', 'notification', 'inline', 'finishline', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn']
        }],
        required: true
    }
});

mongoose.model('LineEvent', lineEventSchema);
