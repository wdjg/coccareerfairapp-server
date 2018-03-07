import mongoose from 'mongoose'

const EMPLOYER_LIMIT = 900000;

var employerSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    data: {
        type: Object,
        default: {}
    },
    passcode: {
        type: Number,
        unique: true,
        required: true,
        index: true
    },
    created_by: {
        type: Date,
        default: Date.now,
    }
});

//helper: generate random 6-digit code
employerSchema.statics.generateRandomCode = function() {
    return Math.floor(Math.random() * EMPLOYER_LIMIT + 100000);
}

mongoose.model('Employer', employerSchema);