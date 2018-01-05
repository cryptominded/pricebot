import fetch from "node-fetch";

export const getCoinList = async () => {
  const res = await fetch("https://coinmarketcap-api.herokuapp.com/coins");
  const CoinArray = await res.json();
  let CoinList = {};

  CoinArray.forEach(coin => {
    CoinList[coin.symbol] = coin;
  });
  return CoinList;
};
