import mongoose from 'mongoose'
import idvalidator from 'mongoose-id-validator'
import randomstring from 'randomstring'
const Schema = mongoose.Schema;
const Employer = mongoose.model('Employer');

var qrCodeValueSchema = new Schema({
    qr_code_value: {
        type: String,
        unique: true,
        required: true,
        default: null,
        index: true
    },
    employer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
        required: true,
        default: null,
        index: true
    },
    created_by: {
        type: Date,
        default: Date.now
    },
    finished_by: {
        type: Date,
        default: null
    }
});

qrCodeValueSchema.plugin(idvalidator);

// for use by cron job
// timeout is in milliseconds
qrCodeValueSchema.statics.createValue = function (employer_id, timeout) {
    var newQR = new this();

    newQR.qr_code_value = randomstring.generate();
    newQR.employer_id = employer_id;
    newQR.created_by = Date.now();
    newQR.finished_by = Date.now() + timeout;

    newQR.save(function(err) {
        if (err) 
            console.log("Error creating a QR code: " + err);
    });
}

// for use by cron job
qrCodeValueSchema.statics.deleteExpired = function () {
    const curDate = Date.now();

    this.remove({ finished_by: {$lt: curDate} }).exec(function(err) {
        if (err)
            console.log("Error deleting expired QR codes: " + err);
    });
}

module.exports = mongoose.model('QRCodeValue', qrCodeValueSchema);