const SlackClient = require('@slack/client');
const utils = require('./utils');
const fetch = require('node-fetch');

const defaultOptions = {
  triggerOnWords: ['?cm'],	
  logger: console,
  rtmOptions: {},
};

const onAuthenticated = (rtmStartData) => {
	botId = rtmStartData.self.id;
	defaultOptions.logger.info(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
};

const cryptoBot = function(botToken, CoinList) { 
	const opt = Object.assign({}, defaultOptions);
	const rtm = new SlackClient.RtmClient(botToken, opt.rtmOptions);
	const web = new SlackClient.WebClient(botToken);
	console.log(CoinList['btc']);

	rtm.on(SlackClient.RTM_EVENTS.MESSAGE, async (event) => {
		if (utils.isMessage(event) && utils.messageContainsText(event, opt.triggerOnWords)) {
			let text = '';	
			const searchedCoin = event.text.split(' ')[1].toUpperCase();
			if (!CoinList[searchedCoin]) {
				web.chat.postMessage(event.channel, 'Could not find coin ' + searchedCoin);
			} else {
				const res = await fetch('https://coinmarketcap-api.herokuapp.com/coins/' + CoinList[searchedCoin].id);
				const coinData = await res.json();
				const msgOptions = {
					as_user: true,
					attachments: [],
				};
				web.chat.postMessage(event.channel, JSON.stringify(coinData), msgOptions);
				opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
			}
		}
	});

	rtm.on(SlackClient.CLIENT_EVENTS.RTM.AUTHENTICATED, onAuthenticated);

	rtm.start();
};

module.exports = cryptoBot;