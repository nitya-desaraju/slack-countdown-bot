require('dotenv').config();
const { App } = require('@slack/bolt');

//configs
const {
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  TARGET_DATE,
  EVENT_NAME,
  SLACK_CHANNEL_ID,
  CRON_SECRET
} = process.env;


const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
});

function generateCountdownBlocks() {
  const targetDate = new Date(TARGET_DATE || new Date(Date.now() + 86400000));
  const now = new Date();
  const eventName = EVENT_NAME || "the event";

  const diffTime = targetDate - now;

  if (diffTime <= 0) {
    return [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `🎉 *${eventName} has started!* 🎉\nThe countdown is over!`
        }
      }
    ];
  }

  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const remainingHours = totalHours % 24;

  const targetDateStr = targetDate.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `⏳ *Countdown to ${eventName}* ⏳`
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": `*Days Left:*` },
        { "type": "mrkdwn", "text": `*${totalDays}*` },
        { "type": "mrkdwn", "text": `*Hours Left:*` },
        { "type": "mrkdwn", "text": `*${remainingHours}* (of ${totalHours} total)` },
        { "type": "mrkdwn", "text": `*Event Date:*` },
        { "type": "plain_text", "text": `${targetDateStr}` },
      ]
    }
  ];
}


async function postScheduledMessage() {
  const blocks = generateCountdownBlocks();
  const text = `Here's your daily countdown to ${EVENT_NAME}.`;

  try {
    await app.client.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel: SLACK_CHANNEL_ID,
      blocks: blocks,
      text: text 
    });
  } catch (error) { 
    console.error('Error sending scheduled message:', error.data || error);
  }
}


app.command('/countdown', async ({ command, ack, say }) => {
  await ack();
  
  const blocks = generateCountdownBlocks();
  await say({
    blocks: blocks,
    text: `Here's the countdown to ${EVENT_NAME}`
  });
});


app.get('/trigger-daily-post', async (req, res) => {
  if (req.query.secret !== CRON_SECRET) {
    console.warn('Unauthorized cron trigger attempt.');
    return res.status(401).send('Unauthorized');
  }

  await postScheduledMessage();
  res.status(200).send('Scheduled message triggered successfully.');
});


(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
})();