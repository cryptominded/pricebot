import fetch from "node-fetch";
import Botkit from "botkit";

const slackController = Botkit.slackbot({ debug: false });

const createBot = token => slackController.spawn({ token }).startRTM();

const createReply = coinData =>
  `*${coinData.symbol} = $${coinData.price_usd} |  ${coinData.price_btc} BTC *
24h price -10.28% | 1h price -3%
24h volume ${coinData.percent_change_24h}% | 1h volume ${
    coinData.percent_change_1h
  }%
Learn more about ${coinData.symbol} → <https://cryptominded.com/coin/${
    coinData.id
  }|cryptominded.com/coin/${coinData.id}>`;

const slackBot = (token, coinList) => {
  const bot = createBot(token);

  slackController.hears(
    "\\?cm (.*)",
    ["direct_message", "ambient"],
    async (bot, msg) => {
      const searchedCoin = msg.match[1].toUpperCase();
      if (!coinList[searchedCoin]) {
        bot.reply(msg, `Could not find coin *${searchedCoin}*`);
      } else {
        const res = await fetch(
          `https://coinmarketcap-api.herokuapp.com/coins/${
            coinList[searchedCoin].id
          }`
        );
        const coinData = await res.json();
        bot.reply(msg, createReply(coinData));
      }
    }
  );
};

export default slackBot;
