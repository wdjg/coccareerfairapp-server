import cron from 'node-cron' 
import UpdateAllPrelineToNotification from './updateAllPrelineToNotification'
import UpdateAllTimeout from './updateAllTimeout'
import UpdateAllQRValues from './updateAllQRValues'

// every 5 seconds
// updateAllPrelineToNotification
cron.schedule("*/5 * * * * *", UpdateAllPrelineToNotification.job)

// every 10 minutes
// updateAllQRValues
cron.schedule("*/10 * * * *", UpdateAllQRValues.job)
