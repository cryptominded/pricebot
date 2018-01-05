const cryptobot = require('./cryptobot');
const utils = require('./utils');
const fetch = require('node-fetch');
if (!process.env.CRYPTOBOT_TOKEN) {
  console.error('You must setup the CRYPTOBOT_TOKEN environment variable before running the bot');
  process.exit(1);
}

// Because callbacks are so 2008 and .then are so 2015
async function init() {
  const CoinList = await utils.getCoinList();
  const res = await fetch('https://coinmarketcap-api.herokuapp.com/coins/bitcoin');
  cryptobot(process.env.CRYPTOBOT_TOKEN, CoinList);
};

init();
