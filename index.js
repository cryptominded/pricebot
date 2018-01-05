require("dotenv").config();
const Botkit = require("botkit");
const fetch = require("node-fetch");

if (!process.env.TOKEN) {
  console.log("Specify token in environment");
  process.exit(1);
}

const slackController = Botkit.slackbot({});

var slackBot = slackController
  .spawn({
    token: process.env.TOKEN
  })
  .startRTM();

// listener that handles incoming messages
slackController.hears(
  [".*"],
  ["direct_message", "direct_mention"],
  (bot, message) => {
    fetch(`https://coinmarketcap-api.herokuapp.com/coins/${message.text}`)
      .then(res => res.json())
      .then(res => {
        slackController.log("Slack message received");
        bot.reply(
          message,
          `I have received your message! ${JSON.stringify(res)}`
        );
      });
  }
);
