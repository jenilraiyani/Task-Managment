const cron = require('node-cron');
const { checkAndSendReminders } = require('../services/reminderService');

// Run every minute
cron.schedule('* * * * *', async () => {
    await checkAndSendReminders();
});
