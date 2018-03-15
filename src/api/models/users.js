import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import idvalidator from 'mongoose-id-validator'
import MongooseValidator from 'mongoose-validatorjs'
const Schema = mongoose.Schema;
const Employer = mongoose.model('Employer');

var options = { discriminatorKey: 'user_type' };

var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    hash: {
        type: String,
        select: false
    },
    salt: {
        type: String,
        select: false
    },
    created_by: {
        type: Date,
        default: Date.now
    },
}, options);

var studentSchema = new Schema({
    major: {
        type: String
    },
    gpa: {
        type: Number
    },
    bio: {
        type: String
    },
    grad_date: {
        type: String //let users customize how they want to display it.
    },
    links: {
        type: [String] //array
    },
    threads: {
        type: String
    },
    positions_desired: {
        type: String
    },
    locations_desired: {
        type: [String]
    }
}, options);

var recruiterSchema = new Schema({
    employer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
        required: true
    },
    bio: {
        type: String
    },
    job_title: {
        type: String
    }
}, options);

var adminSchema = new Schema({
    // this only exists so that user_type 'admin' can be a thing.
}, options);

userSchema.plugin(idvalidator);

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    if (this.user_type === 'recruiter') {
        return jwt.sign({
            _id: this._id,
            email: this.email,
            name: this.name,
            user_type: this.user_type,
            employer_id: this.employer_id,
            exp: parseInt(expiry.getTime() / 1000),
        }, process.env.SECRET);
    } else {
        return jwt.sign({
            _id: this._id,
            email: this.email,
            name: this.name,
            user_type: this.user_type,
            exp: parseInt(expiry.getTime() / 1000),
        }, process.env.SECRET);
    }

};

var User = mongoose.model('User', userSchema);
var Student = User.discriminator('student', studentSchema);
var Recruiter = User.discriminator('recruiter', recruiterSchema);
var Admin = User.discriminator('admin', adminSchema);

module.exports = { User, Student, Recruiter, Admin};