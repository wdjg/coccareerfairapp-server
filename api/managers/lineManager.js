var mongoose = require('mongoose')
var Line = mongoose.model('Line');
var LineEvent = mongoose.model('LineEvent');
var NotificationManager = require('./notificationManager');

const BATCH_SIZE = 5;
const TIMEOUT_MSEC = 1000*60*10; // 10 minutes

// uses notification manager to notify student of notification status update
function notifyLine(line) {
    console.log("LineManager: Notifying student, line info: " + line);

}
// notifies students up until the BATCH_SIZE per employer
function updateAllPrelineToNotification() {
    // console.log('LineManager: updating preline to notification')
    // counts how many users are in Notification(N) or Inline(IL)
    // N + IL <= BATCH_SIZE
    var employerToCountMap = {};

    // keeps track of lines to notify per employer
    var employerToLinesMap = {};

    // query to count all notification and inline, grouped by employer_id
    // i can probably replace this with count and group by.
    // Line.find({}).count().group('employer_id');
    var query = Line.find({}).where('status').in(["notification", "inline"]);
    query.exec(function(err, lines) {
        if (err)
            return console.log("LineManagerError: " + err);
        // count up lines by employer
        lines.forEach( function(line) {
            if (employerToCountMap[line.employer_id]) {
                employerToCountMap[line.employer_id]++;
            } else {
                employerToCountMap[line.employer_id] = 1;
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
                if (employerToLinesMap[line.employer_id]) {
                    // add to the array, as long as selected PL + N + IL < BATCH_SIZE
                    if (employerToLinesMap[line.employer_id].length + employerToCountMap[line.employer_id] || 0 < BATCH_SIZE) {
                        employerToLinesMap[line.employer_id].push(line);
                    }
                } else {
                    // otherwise create the array, as long as N + IL is not maxed out.
                    if (employerToCountMap[line.employer_id] || 0 < BATCH_SIZE) {
                        employerToLinesMap[line.employer_id] = [line];
                    } 
                }
            });
        }).then(function(){
            // console.log(employerToCountMap)
            // console.log(employerToLinesMap)
            // for each line item, change from preline to notificatio and notify the user.
            for (var key in employerToLinesMap) {
                var lines = employerToLinesMap[key];
                lines.forEach( function(line) {
                    line.updateStatus("notification");
                    notifyLine(line);
                });
            }
        });
    });


}

function updateAllNotificationTimeout() {

}

module.exports.updateAllLines = function() {
    // console.log("LineManager: Updating all lines...");
    updateAllPrelineToNotification();
    updateAllNotificationTimeout();
}

module.exports.startLineManager = function() {
    setInterval(module.exports.updateAllLines, 5000) // every 5 seconds updateAllLines
}