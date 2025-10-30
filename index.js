require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');

//configs
const {
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
  TARGET_DATE,
  EVENT_NAME,
  SLACK_CHANNEL_ID,
  CRON_SECRET
} = process.env;

if (!SLACK_BOT_TOKEN || !SLACK_SIGNING_SECRET) {
  console.error('Error: SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET must be set.');
}

const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});


const app = new App({
  token: SLACK_BOT_TOKEN,
  receiver: receiver,
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
          "text": `🎉 *${eventName.toUpperCase()} HAS COMMENCED!* 🎉`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":athena-nyc-orpheus: Happy Hacking! :athena-award:"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":laptop_parrot: :laptop_parrot: :laptop_parrot:"
        }
      }
    ];
  }


  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `⏳Countdown to ${eventName}! ✨:parthenon-logo:`
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*${days}* days, *${hours}* hours, *${minutes}* minutes, and *${seconds}* seconds left!`
      }
    }
  ];
}

async function postScheduledMessage() {
  if (!SLACK_CHANNEL_ID) {
    console.error('SLACK_CHANNEL_ID is not set. Cannot post scheduled message.');
    return;
  }

  const blocks = generateCountdownBlocks();
  const text = `Here's your daily countdown for ${EVENT_NAME}.`;

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

receiver.app.get('/trigger-daily-post', async (req, res) => {

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