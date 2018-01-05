import dotenv from "dotenv";
import Botkit from "botkit";
import fetch from "node-fetch";
import { fetchCoins, findCoinFromSymbol } from "./utils";

dotenv.config();

if (!process.env.TOKEN) {
  console.log("Specify token in environment");
  process.exit(1);
}

let coins;
const slackController = Botkit.slackbot({});

const slackBot = slackController
  .spawn({
    token: process.env.TOKEN
  })
  .startRTM();

fetchCoins().then(res => (coins = res));

// listener that handles incoming messages
slackController.hears(
  "\\?cm (.*)",
  ["direct_message", "direct_mention", "ambient"],
  (bot, message) => {
    var coinSymbol = message.match[1];
    const coinId = findCoinFromSymbol(coinSymbol, coins);

    fetch(`https://coinmarketcap-api.herokuapp.com/coins/${coinId}`)
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
