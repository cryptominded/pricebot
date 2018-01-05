const utils = require('./utils');
const fetch = require('node-fetch');
const Botkit = require('botkit');

const defaultOptions = {
  triggerOnWords: ['?cm'],	
  logger: console,
  rtmOptions: {},
};

const onAuthenticated = (rtmStartData) => {
	botId = rtmStartData.self.id;
	defaultOptions.logger.info(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
};

const SlackController = Botkit.slackbot({debug: true});

const cryptoBot = function(botToken, CoinList) { 
	const bot = SlackController.spawn({token: botToken}).startRTM();
	SlackController.hears(
		"\\?cm (.*)",
		["direct_message", "direct_mention", "ambient"], async (bot, message) => {
		const searchedCoin = message.text.split(' ')[1].toUpperCase();
		if (!CoinList[searchedCoin]) {
			bot.reply(message, 'Could not find coin ' + searchedCoin);
		} else {
			const res = await fetch('https://coinmarketcap-api.herokuapp.com/coins/' + CoinList[searchedCoin].id);
			const coinData = await res.json();
			bot.reply(message, JSON.stringify(coinData));
		}
	});
};

module.exports = cryptoBot;