import mongoose from 'mongoose'
const User = mongoose.model('User');
const QRCodeValue = mongoose.model('QRCodeValue');

import response from './response.js'

//get /qr?employer_id=xxx (or qr_code_value=xxx)
function getQRWithQuery(req, res) {

	if (req.query.employer_id) {
		return getQRByEmployerId(req, res);
	} else if (req.query.qr_code_value) {
		return getQRByCodeValue(req, res);
	} else {
		return res.status(400).json({
			"message": response.getQRMissingQuery
		});
	}
    
}

//helper for get /qr?employer_id=xxx
function getQRByEmployerId(req, res) {
	if (req.user.user_type === 'student') {
        res.status(401).json({
            "message": response.authNoStudentsAllowed
        });
    } else {
        QRCodeValue.findOne({ employer_id: req.query.employer_id })
        		   .sort({ created_by: -1 })
        		   .exec(function (err, QRvalue) {
            if (err)
                return res.send(err);
            if (!QRvalue) 
            	return res.status(404).json({
            		"message": response.getQRNotFound
            	});
            return res.status(200).json(QRvalue);
        });
    }
}

//helper for get /qr?qr_code_value=xxx
function getQRByCodeValue(req, res) {
	QRCodeValue.findOne({ qr_code_value: req.query.qr_code_value }).exec(function (err, QRvalue) {
		if (err)
			return res.send(err);
		if (!QRvalue)
        	return res.status(404).json({
        		"message": response.getQRNotFound
        	});
        return res.status(200).json(QRvalue);
	});
}

export default { getQRWithQuery }