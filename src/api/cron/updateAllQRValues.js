import mongoose from 'mongoose'
import randomstring from 'randomstring'
const Employer = mongoose.model('Employer');

//every 10 minutes: give each employer a new random qr code value
function job() {
	var query = Employer.find({});
	query.exec( function (err, employers) {
		if (err) {
			return console.log("QRUpdaterError: " + err);
		}

		employers.forEach( function (employer) {
			employer.qr_code_value = randomstring.generate();
			console.log('Created QR code value for employer %s, with %s', employer.name, employer.qr_code_value);
            employer.save( function (err) {
                if (err)
                    return console.log("QRUpdaterError: " + err);
            });
		});
	});
}

export default { job }