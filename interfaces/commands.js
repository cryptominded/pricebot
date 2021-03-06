import fetch from "node-fetch";
import request from "request";
import getCoinInstance from "../utils";
import SlackSchema from "../routes/slackSchema";
import FeedbackSchema from "../routes/feedbackSchema";
import {createPriceReply, createTopReply, reducePrecision} from './replyFormatters';
import trackEvent from '../tracking';

const Coin = getCoinInstance();

const graph = token => async (bot, msg) => {
  const args = msg.match[1].toUpperCase().trim().split(' ');
  let firstCoin = args[0];
  let secondCoin = args[1];
  let period = args[2];

  if (!Coin.isCoinValid(firstCoin) && secondCoin && !Coin.isCoinValid(secondCoin) && secondCoin !== '1WEEK' && secondCoin !== '1DAY') {
    bot.reply(msg, `Could not find coins *${firstCoin}*/*${secondCoin}*`);
  } else if (period && period != 'DAY' && period != 'WEEK') {
    bot.reply(msg, `Period must be DAY or WEEK`);
  } else {
    if (!period) {
      if (secondCoin === 'DAY' || secondCoin === 'WEEK') {
        period = '1' + secondCoin;
        secondCoin = null;
      } else {
        period = '1DAY';
      }
    }
    if (!secondCoin) {
      secondCoin = firstCoin;
      firstCoin = 'EUR';
    }
    trackEvent(msg.team, {ec: 'graph', ea: firstCoin, user: msg.user});
    const url = `https://cryptominded-graphs.herokuapp.com/graph?fontscale=20&tsym=${firstCoin.toLowerCase()}&fsym=${secondCoin.toLowerCase()}&period=${period.toLowerCase()}`
    const res = await fetch(url);
    const fileName = `${firstCoin}/${secondCoin} - ${period}`;

    if (res.status === 200) {
      const image = await res.buffer();
      request.post({
        url: 'https://slack.com/api/files.upload',
        formData: {
          token,
          title: fileName,
          filename: fileName,
          filetype: 'auto',
          channels: msg.channel,
          file: {
            value: image,
            options: {
              filename: fileName
            }
          }
        },
      });  
    } else {
      bot.reply(msg, `Unable to draw graph for ${fileName}`);
    }
  }
}

const top = (bot, msg) => {
  bot.reply(msg, createTopReply(Coin.getTopCoins()));
}

const lamboPriceUsd = "1.900.000";
const lamboPriceEur = "1.543.000";

const price = async (bot, msg) => {
  const searchedCoin = msg.match[1].toUpperCase().trim();
  if (searchedCoin === 'LAMBO') {
    const btc = Coin.getCoinData('BTC');
    const reply = `*#0 Centenario Lamborghini (LAMBO) - $${lamboPriceUsd} | €${lamboPriceEur} | ₿${reducePrecision(1900000 / btc.price_usd)} BTC*
    I already have two thanks to Bitconeeeeeeeeeeect`;
    bot.reply(msg, reply);
  } else if (!Coin.isCoinValid(searchedCoin)) {
    bot.reply(msg, `Could not find coin *${searchedCoin}*. Type ?cm help to get a list of commands`);
  } else {
    trackEvent(msg.team, {ec: 'price', ea: searchedCoin, user: msg.user});    
    bot.reply(msg, createPriceReply(Coin.getCoinData(searchedCoin)));
  }
}

const alert = teamId => async (bot, msg) => {
  bot.api.users.info({user: msg.user}, async (error, response) => {
    if (error) {
      bot.reply(msg, 'I\'m sorry, I wasn\'t able to get your identity from slack...');
    } else {
      if (msg.type !== 'direct_message' && !response.user.is_admin) {
        bot.reply(msg, 'I\'m sorry, only an admin can add alerts to a public channel');
        return;
      }
      const slack = await SlackSchema.findOne({teamId});
      if (slack.alertChannels.indexOf(msg.channel) > -1) {
        trackEvent(msg.team, {ec: 'alert', user: msg.user});
        slack.alertChannels = slack.alertChannels.filter((channel) => msg.channel !== channel);
        bot.reply(msg, 'This channel will no longer receive pump and dump alerts');
      } else {
        slack.alertChannels.push(msg.channel);
        bot.reply(msg, 'This channel will now receive pump and dump alerts');
      }
      await slack.save();
    }
  })
};

const help = (bot, msg) => {
  bot.reply(msg, `
    \n
    \`?cm TICKER|NAME\` to get a live ticker. Ex: \`?cm btc\` or \`?cm bitcoin\`
    \`?cm graph TICKER\` to get a realtime graph for a TICKER. Ex: \`?cm graph eth btc week|day\`
    \`?cm top\` to get the top5 cryptocurrencies.
    \`?cm feedback\` to give some feedback about the bot.
    \`?cm help\` to display this message :).
  `);
}

const feedback = teamId => async (bot, msg) => {
  trackEvent(msg.team, {ec: 'feedback', user: msg.user});
  console.log(msg.match);
  if (msg.match[1].length === 0) {
    bot.reply(msg, `You forgot your feedback ! Syntax is ?cm feedback your feedback here`);
  } else {
    bot.reply(msg, `Thank you for your feedback! Feel free to leave your email so I can reach out to you!`);
    const feedback = new FeedbackSchema({
      message: msg.match[1],
      userId: msg.user,
      teamId
    });
    await feedback.save();
  }
}

export default (token, teamId) => {
  return (
    [{
      func: alert(teamId),
      keyword: " alert(.*)",
      conditions: ["direct_message", "ambient"]
    }, {
      func: top,
      keyword: " top(.*)",
      conditions: ["direct_message", "ambient"]
    }, {
      func: graph(token),
      keyword: " graph(.*)",
      conditions: ["direct_message", "ambient"]
    }, {
      func: help,
      keyword: " help(.*)",
      conditions: ["direct_message", "ambient"]
    }, {
      func: feedback(teamId),
      keyword: " feedback(.*)",
      conditions: ["direct_message", "ambient"]
    }, {
      // Price needs to be last
      func: price,
      keyword: " (.*)",
      conditions: ["direct_message", "ambient"]
    }
  ]);
};