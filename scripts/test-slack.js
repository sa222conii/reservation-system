const fs = require('fs');
const path = require('path');
const { IncomingWebhook } = require('@slack/webhook');

// Manually read .env file since dotenv might not be installed
const envPath = path.join(__dirname, '../.env');
let webhookUrl = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('SLACK_WEBHOOK_URL=')) {
      webhookUrl = line.split('=')[1].trim();
      // Remove quotes if present
      if ((webhookUrl.startsWith('"') && webhookUrl.endsWith('"')) || (webhookUrl.startsWith("'") && webhookUrl.endsWith("'"))) {
        webhookUrl = webhookUrl.slice(1, -1);
      }
      break;
    }
  }
} catch (e) {
  console.error('Error reading .env file:', e.message);
  process.exit(1);
}

if (!webhookUrl) {
  console.error('SLACK_WEBHOOK_URL not found in .env');
  process.exit(1);
}

console.log('Found Webhook URL:', webhookUrl.substring(0, 20) + '...');

const webhook = new IncomingWebhook(webhookUrl);

(async () => {
  try {
    await webhook.send({
      text: '🔔 Test Notification from Reservation System',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔔 Test Notification',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Status:* Success!\nYour Slack Webhook is configured correctly.',
          },
        },
      ],
    });
    console.log('✅ Test notification sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
  }
})();
