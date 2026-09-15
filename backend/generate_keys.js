const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();
const envPath = path.join(__dirname, '.env');

const envContent = `\n# Web Push VAPID Keys\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:admin@taskora.com\n`;

fs.appendFileSync(envPath, envContent);
console.log('VAPID keys generated and appended to .env');
console.log('PUBLIC_KEY=', vapidKeys.publicKey);
