import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { getCoinList } from "./utils";
import slackBot from "./interfaces/slack";
import http from "http";

const server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.end();
});

server.listen(process.env.PORT || 80);

if (!process.env.CRYPTOBOT_SLACK_TOKEN) {
  console.error(
    "You must setup the CRYPTOBOT_SLACK_TOKEN environment variable before running the bot"
  );
  process.exit(1);
}

// Because callbacks are so 2008 and .then are so 2015
async function init() {
  const coinList = await getCoinList();
  slackBot(process.env.CRYPTOBOT_SLACK_TOKEN, coinList);
}

init();
