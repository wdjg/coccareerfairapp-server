import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

function sendEmailNotification(email, params) {

    var templatePath = path.join(__dirname, '../views/templates/emailNotificationTemplate/template.html');
    fs.readFile(templatePath, function(err, html) {
        if (err)
            return console.log("NotificationManagerError: Unable to open email template file " + err);

        sendEmail(email, html, params);
    });

}

function sendEmail(email, html, params) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass  // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: email, // list of receivers
            subject: (params["name"] || "Hey") + "! - Its your turn in line!", // Subject line
            text: '', // plain text body
            html: html // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });

}

export default { sendEmailNotification }