import fetch from "node-fetch";

export const fetchCoins = () =>
  fetch(`https://coinmarketcap-api.herokuapp.com/coins`).then(res =>
    res.json()
  );

export const findCoinFromSymbol = (symbol, coins) => {
  const uppercasedSymbol = symbol.toUpperCase();
  return coins.find(c => c.symbol === uppercasedSymbol);
};
