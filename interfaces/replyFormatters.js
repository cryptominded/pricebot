export const reducePrecision = number => parseFloat(Number(number).toFixed(3));

// #1 Bitcoin (BTC) - $16800.00 | €13966.24 | 1.0 BTC
export const createPriceReply = (coinData, additionalAttachments = [], additionalText = '') => {
  return ({
    text: `${additionalText}*#${coinData.rank} ${coinData.name} (${coinData.symbol}) - $${reducePrecision(coinData.price_usd)} | €${reducePrecision(coinData.price_eur)} | ₿${coinData.price_btc} *
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
            type: 'button',
            text: `Learn more about ${coinData.symbol} `,
            url: `https://cryptominded.com/coin/${coinData.id}?ref=cm-bot`,
            style: 'primary'
          }
        ]
      },
    ]
  });
};
  
export const createTopReply = topCoins => {
  let response = '\`\`\`';
  let hourChange = 0;
  let dayChange = 0;
  let weekChange = 0;
  topCoins.forEach(coin => {
      response += `#${coin.rank} ${coin.name} (${coin.symbol}) - $${reducePrecision(coin.price_usd)} | €${reducePrecision(coin.price_eur)} | ₿${coin.price_btc}\n`;
      hourChange += Number(coin.percent_change_1h);
      dayChange += Number(coin.percent_change_24h);
      weekChange += Number(coin.percent_change_7d);
  });
  hourChange = hourChange / 5;
  dayChange = dayChange / 5;
  weekChange = weekChange / 5;

  response += `\`\`\`
  1h average price   *${reducePrecision(hourChange)}%*
  24h average price *${reducePrecision(dayChange)}%*
  7d average price   *${reducePrecision(weekChange)}%*`;
  return (response);
};