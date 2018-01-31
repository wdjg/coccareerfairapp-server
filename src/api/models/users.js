import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

var UsersSchema = new mongoose.Schema({
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
        type: [{
            type: String,
            enum: ['student', 'recruiter']
        }],
        default: ['student']
    },
    employer_id: {
        type: String,
        default: null,
    }
});

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
