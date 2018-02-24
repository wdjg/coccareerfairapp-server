import mongoose from 'mongoose'
const Employer = mongoose.model('Employer');
const QRCodeValue = mongoose.model('QRCodeValue');

//10 minutes, measured in milliseconds.
//If you change this, consider changing how frequently of this job as well.
const timeout = 1000*60*10;
//const timeout = 1000*30; //debug of 30 seconds

//Delete expired code values
//Give each employer a new random qr code value
function job() {
	QRCodeValue.deleteExpired();

	var query = Employer.find({});
	query.exec( function (err, employers) {
		if (err) {
			return console.log("QRUpdaterError: " + err);
		}

		employers.forEach( function (employer) {
			QRCodeValue.createValue(employer._id, timeout);
			console.log('Created QR code value for employer %s', employer.name);
		});
	});
}

export default { job }