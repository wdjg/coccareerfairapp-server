import mongoose from 'mongoose'

var employerSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    qr_code_value: {
    	type: String,
    	unique: true,
    	default: null,
    	index: true
    },
    created_by: {
        type: Date,
        default: Date.now,
    },
    color: {
        type: String,
        default: '#f3c148'
    },
    type: {
        type: String,
    },
    overview: {
        type: String,
    },
    website: {
        type: String,
    },
    attending: {
        type: Date,
    }
});

mongoose.model('Employer', employerSchema);