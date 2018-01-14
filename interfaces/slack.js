import fetch from "node-fetch";
import Botkit from "botkit";
import request from "request";

const slackController = Botkit.slackbot({ debug: false });

const createBot = token => slackController.spawn({
  token,
  require_delivery: true,
}).startRTM();

const reducePrecision = number => parseFloat(Number(number).toFixed(3));

const summonKeyword = '\\?cmdev';

// #1 Bitcoin (BTC) - $16800.00 | €13966.24 | 1.0 BTC
const createReply = (coinData, additionalAttachments = []) => {
  return ({
    text: `*#${coinData.rank} ${coinData.name} (${coinData.symbol}) - $${reducePrecision(coinData.price_usd)} | €${reducePrecision(coinData.price_eur)} | ₿${coinData.price_btc} *
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
      },
    ]
  });
};

const createGraphTemplateAttachment = graphData => {
  return({
    fallback: "Required plain-text summary of the attachment.",
    title: "GraphData",
    image_url: "http://my-website.com/path/to/image.jpg",
    thumb_url: "http://example.com/path/to/thumb.png",
    footer: "Slack API",
    footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
    ts: 123456789
  });
};

const slackBot = (token, coinList) => {
  const bot = createBot(token);

  slackController.hears(
    summonKeyword + " graph(.*)",
    ["direct_message", "ambient"],
    async (bot, msg) => {
      const searchedCoin = msg.match[1].toUpperCase().trim();
      if (!coinList[searchedCoin]) {
        bot.reply(msg, `Could not find coin *${searchedCoin}*`);
      } else {
        const res = await fetch(
          `https://cryptominded-graphs.herokuapp.com/graph?fontscale=20&tsym=eur&fsym=${
            searchedCoin.toLowerCase()
          }`
        );
        const image = await res.buffer();
        request.post({
          url: 'https://slack.com/api/files.upload',
          formData: {
            token: process.env.CRYPTOBOT_SLACK_TOKEN,
            title: "Image",
            filename: "image.png",
            filetype: "auto",
            channels: msg.channel,
            file: {
              value: image,
              options: {
                filename: 'myfile.bin'
              }
            }
          },
        }, function (err, response) {
          console.log(err);
          console.log(JSON.parse(response.body));
        });
      }
    }
  );

  slackController.hears(
    summonKeyword + " (.*)",
    ["direct_message", "ambient"],
    async (bot, msg) => {
      const searchedCoin = msg.match[1].toUpperCase().trim();
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
