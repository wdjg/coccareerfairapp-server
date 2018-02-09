import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import idvalidator from 'mongoose-id-validator'
import MongooseValidator from 'mongoose-validatorjs'
const Schema = mongoose.Schema;
const Employer = mongoose.model('Employer');

var UsersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    hash: String,
    salt: String,

    created_by: {
        type: Date,
        default: Date.now
    },
    user_type: {
        type: String,
        enum: ['student', 'recruiter'],
        default: 'student',

        /* If user_type is left blank, the custom validator will not execute.
           So, require user_type to be specified if emp_id is not null,
           so we can verify that user_type is recruiter. */
        required: [function() {
            return this.employer_id !== undefined;
        }, 'If employer_id is specified, user_type must be recruiter'],

        validator: function(v, cb) {
            if (v === 'recruiter') {
                Employer.findById(this.employer_id).exec( function (err, employer){
                    if (err || !employer) {
                        cb(false, 'UserValidationError: Invalid employer_id');
                    } else {
                        cb(true);
                    }
                })
            } else {
                cb(this.employer_id === undefined);
            }
        }
    },
    employer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
        required: [function() {
            return this.user_type === 'recruiter';
        }, 'If user_type is recruiter, employer_id must be specified'],
        default: null
    }
});

UsersSchema.plugin(idvalidator);

UsersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UsersSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        exp: parseInt(expiry.getTime() / 1000),
    }, process.env.SECRET);
};

module.exports = mongoose.model('User', UsersSchema);
