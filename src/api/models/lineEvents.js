import mongoose from 'mongoose'

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
        type: String,
        enum: ['preline', 'notification', 'inline', 'startrecruiter', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn'],
        required: true
    }
});

mongoose.model('LineEvent', lineEventSchema);
