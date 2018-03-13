import fetch from "node-fetch";
import SlackSchema from './routes/slackSchema';
import {createPriceReply} from "./interfaces/replyFormatters";

class Coins {
  constructor() {
    this.coinListTicker = {};
    this.coinListName = {};
    this.topCoins = [];
    this.botInstances = {};
    this.alertedCoins = [];
    setInterval(async () => {
      await this.refreshCoinList();
    }, 5 * 60 * 1000);
  }

  getTopCoins() {
    return this.topCoins;
  }

  isCoinValid(coin) {
    return (this.coinListTicker[coin] || this.coinListName[coin]) && coin !== 'EUR' && coin !== 'USD';
  }

  getCoinData(coinSymbol) {
    return this.coinListTicker[coinSymbol] || this.coinListName[coinSymbol];
  }

  async sendAlert(coin) {
    if (Object.keys(this.botInstances).length === 0
      || this.alertedCoins.indexOf(coin.name) > -1) {
      return;
    }
    var self = this;
    const slacks = await SlackSchema.find({alertChannels: {$gt: []}});
    slacks.forEach(slack => {
      slack.alertChannels.forEach(channel => {
        this.botInstances[slack.teamId].send({
          channel: channel,
          ...createPriceReply(coin, null, "💹 *Pump&Dump Alert* 🚀 \n")
        });
      });
    });
    this.alertedCoins.push(coin.name);
    setTimeout(() => {
      self.alertedCoins.splice(this.alertedCoins.indexOf(coin.name));
    }, 20 * 60 * 1000); // remove from the array after 20 minutes
  }

  detectPumpAndDump(coinList) {
    Object.keys(coinList).filter(coin => {
      if ((Math.abs(Number(coinList[coin].percent_change_1h)) > 10
        && (Math.abs(Number(coinList[coin].percent_change_1h)) - Math.abs(Number(coinList[coin].percent_change_24h)) < 10))
        || Math.abs(Number(coinList[coin].percent_change_24h)) > 50) {
        this.sendAlert(coinList[coin]);
      }
    });
  }

  addBotInstance(botInstance, teamId) {
    this.botInstances[teamId] = botInstance;
  }

  refreshCoinList() {
    var self = this;
    return new Promise(async (resolve, reject) => {
      const promisesCall = [];
      const pageNumber = 15;
      const tempTopCoins = [];
      for (let start = 0; start < pageNumber * 100; start += 100) {
        promisesCall.push(new Promise(async function(resolve, reject) {
          const res = await fetch(`https://api.coinmarketcap.com/v1/ticker/?convert=EUR&start=${start}`);
          const CoinArray = await res.json();
          let CoinList = {};
          if (start === 0 && (self.botInstances.length !== 0)) {
            self.detectPumpAndDump(CoinArray);
          }
          CoinArray.forEach((coin, index) => {
            if (start === 0 && index < 5) {
              tempTopCoins.push(coin);
            }
            CoinList[coin.symbol] = coin;
          });
          resolve(CoinList);
        }));
      };

      // Get Coins from coinmarketcal
      // https://coinmarketcal.com/api/coins
      const coinMarketCalRes = await fetch('https://coinmarketcal.com/api/coins');
      const weirdFormatCoins = await coinMarketCalRes.json();
      weirdFormatCoins.forEach(coin => {

      });

      const res = await Promise.all(promisesCall);
      const CoinList = {};
      res.forEach(res => {
        Object.assign(CoinList, res);
      });
      self.coinListTicker = CoinList;
      self.coinListName = Object.keys(self.coinListTicker).reduce((acc, cur) => {
        acc[CoinList[cur].name.toUpperCase()] = CoinList[cur];
        return acc;
      }, {});
      self.topCoins = tempTopCoins;

      console.log(weirdFormatCoins);
      console.log(new Date().toUTCString(), ' - Coin list updated');
      resolve(CoinList);
    });
  }
}

let CoinInstance = null;

export default () => {
  if (!CoinInstance) {
    CoinInstance = new Coins();
  }
  return CoinInstance;
}

