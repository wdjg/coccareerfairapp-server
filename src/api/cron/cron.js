import cron from 'node-cron' 
import UpdateAllPrelineToNotification from './updateAllPrelineToNotification'
import UpdateAllTimeout from './updateAllTimeout'

// every 5 seconds
// updateAllPrelineToNotification
cron.schedule("5 * * * * *", UpdateAllPrelineToNotification.job)
