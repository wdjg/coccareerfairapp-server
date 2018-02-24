import mongoose from 'mongoose'

var employerSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    created_by: {
        type: Date,
        default: Date.now,
    },
});

mongoose.model('Employer', employerSchema);