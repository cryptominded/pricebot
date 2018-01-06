import fetch from "node-fetch";
import Botkit from "botkit";

const slackController = Botkit.slackbot({ debug: false });

const createBot = token => slackController.spawn({ token }).startRTM();

const createReply = coinData => ({
  text: `*${coinData.symbol} - RANK #${coinData.rank} > $${Number(coinData.price_usd).toPrecision(2)} | ${Number(coinData.price_eur).toPrecision(2)}€ | ${coinData.price_btc} BTC *
    1h price ${coinData.percent_change_1h}%
    24h price ${coinData.percent_change_24h}%
    7d price ${coinData.percent_change_7d}%`,
  attachments: [
    {
      fallback: `Learn more about ${
        coinData.symbol
      } → https://cryptominded.com/coin/${coinData.id}`,
      actions: [
        {
          type: "button",
          text: `Learn more about ${coinData.symbol} `,
          url: `https://cryptominded.com/coin/${coinData.id}`,
          style: "primary"
        }
      ]
    }
  ]
});

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
