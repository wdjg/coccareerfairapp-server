import mongoose from 'mongoose'
import idvalidator from 'mongoose-id-validator'
const Schema = mongoose.Schema;

var lineEventSchema = new mongoose.Schema({
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
    line_id: {
        type: Schema.Types.ObjectId,
        //no ref since line objects are so short lived (?)
        required: true,
        index: true
    },
    created_by: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ['preline', 'notification', 'inline', 'startrecruiter', 'finishrecruiter', 'timeoutchurn', 'voluntarychurn'],
        required: true,
        index: true
    }
});

lineEventSchema.plugin(idvalidator);


mongoose.model('LineEvent', lineEventSchema);
