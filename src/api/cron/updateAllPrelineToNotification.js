import mongoose from 'mongoose'
import EmailNotificationManager from "../managers/emailNotificationManager.js"
const Line = mongoose.model('Line');
const User = mongoose.model('User');
const LineEvent = mongoose.model('LineEvent');

const BATCH_SIZE = Line.getBatchSize();

// notifies students up until the BATCH_SIZE per employer
function job() {
    // console.log('LineManager: updating preline to notification')
    // counts how many users are in Notification(N) or Inline(IL)
    // N + IL <= BATCH_SIZE
    var countNotifAndInline = {};

    // keeps track of lines to notify per employer
    var countPreline = {};

    // query to count all notification and inline, grouped by employer_id
    // i can probably replace this with count and group by.
    // Line.find({}).count().group('employer_id');
    var query = Line.find({}).where('status').in(["notification", "inline"]);
    query.exec(function(err, lines) {
        if (err)
            return console.log("LineManagerError: " + err);
        // count up lines by employer
        lines.forEach( function(line) {
            if (countNotifAndInline[line.employer_id]) {
                countNotifAndInline[line.employer_id]++;
            } else {
                countNotifAndInline[line.employer_id] = 1;
            }
        });

    }).then(function() {

        // query for all preline n students, sorted by desc order.
        query = Line.find({status: "preline"}).sort({updated_by: -1});
        query.exec(function(err, lines) {
            if (err) 
                return console.log("LineManagerError: " + err);

            // keep track of prelines to update to notification
            lines.forEach( function(line) {
                // if it exists
                if (countPreline[line.employer_id]) {
                    // add to the array, as long as selected PL + N + IL < BATCH_SIZE
                    if ((countPreline[line.employer_id].length + countNotifAndInline[line.employer_id] || 0) < BATCH_SIZE) {
                        countPreline[line.employer_id].push(line);
                    }
                } else {
                    // otherwise create the array, as long as N + IL is not maxed out.
                    if ((countNotifAndInline[line.employer_id] || 0) < BATCH_SIZE) {
                        countPreline[line.employer_id] = [line];
                    } 
                }
            });
        }).then(function(){
            // console.log(countNotifAndInline)
            // console.log(countPreline)
            // for each line item, change from preline to notificatio and notify the user.
            for (var key in countPreline) {
                var lines = countPreline[key];
                lines.forEach( async function(line) {
                    let msg = await line.updateStatus("notification")
                    // send email notification to student to signal change.
                    if (msg !== 'success') {
                        console.log("LineManagerError: failed to update status for line: " + line);
                        return;
                    }
                    User.findOne({_id: line.user_id}).exec(function(err, user){
                        if (err)
                            return console.log("LineManagerError: error for finding user for line: " + line + " with error: " + err);
                        
                        var params = {
                            name: user.name
                        }
                        EmailNotificationManager.sendEmailNotification(user.email, params);
                    });
                });
            }
        });
    });
}

export default { job }

