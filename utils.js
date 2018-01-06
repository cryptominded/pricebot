import fetch from "node-fetch";

const promisesCall = [];

export const getCoinList = async () => {
  // https://coinmarketcap-api.herokuapp.com/coins?page=14
  for (var i = 1; i < 15; i++) {
    promisesCall.push(new Promise(async function(resolve, reject) {
      const res = await fetch(`https://coinmarketcap-api.herokuapp.com/coins?page=${i}`);
      const CoinArray = await res.json();
      var CoinList = {};
      CoinArray.forEach(coin => {
        CoinList[coin.symbol] = coin;
      });
      resolve(CoinList);
    }));
  };

  const res = await Promise.all(promisesCall);
  const CoinList = {};
  res.forEach(res => {
    Object.assign(CoinList, res);
  });
  return CoinList;
};
