const fetch = require('node-fetch');

const isMessage = event => Boolean(event.type === 'message' && event.text);

const getCoinList = async () => {
  const res = await fetch('https://coinmarketcap-api.herokuapp.com/coins');
  const CoinArray = await res.json();
  let CoinList = {};

  CoinArray.forEach(coin => {
    CoinList[coin.symbol] = coin;
  });
  return CoinList;
};

const messageContainsText = (message, possibleTexts) => {
  const messageText = message.text.toLowerCase();
  const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
  for (const text of texts) {
    if (messageText.indexOf(text.toLowerCase()) > -1) {
      return true;
    }
  }

  return false;
};

module.exports = {
  isMessage,
  getCoinList,
	messageContainsText
};