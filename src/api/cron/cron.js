import cron from 'node-cron' 
import UpdateAllPrelineToNotification from './updateAllPrelineToNotification'
import UpdateAllTimeout from './updateAllTimeout'
import UpdateAllQRValues from './updateAllQRValues'

// every 5 seconds
// updateAllPrelineToNotification
cron.schedule("*/5 * * * * *", UpdateAllPrelineToNotification.job)

// every 5 minutes (timeout is 10; this way we have 2 QR codes available per employer at a time)
// if you change this, consider changing the timeout value in UpdateAllQRValues.
// updateAllQRValues
cron.schedule("*/5 * * * *", UpdateAllQRValues.job)
//cron.schedule("*/15 * * * * *", UpdateAllQRValues.job) //debug: every 15 seconds
