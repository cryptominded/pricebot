import dotenv from "dotenv";
dotenv.config();
console.log(process.env.NEWRELIC);
import 'newrelic';
import createCoinInstance from "./utils";
import slackBot from "./interfaces/slack";
import express from "express";
import oauth from "./routes/oauth";
import mongoose from 'mongoose';
import SlackSchema from './routes/slackSchema';
import path from "path";

const server = express();
const __dirname = path.resolve();

const port = process.env.PORT || 3000;

const init = async () => {
  await mongoose.connect(process.env.MONGODB_URI || `mongodb://localhost/myappdatabase`);  
  await server.listen(port);
  console.log(`Server listening on port ${port}!`);
  const Coin = createCoinInstance();
  await Coin.refreshCoinList();
  const slacks = await SlackSchema.find({});
  slacks.forEach(slack => {
    const botInstance = slackBot(slack.botAccessToken, slack.teamId);
    Coin.addBotInstance(botInstance, slack.teamId);
    console.log(`Connected to: ${slack.teamName} ${slack.teamId}`);
  });
};

server.use(express.static('views'))
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/'));
});

server.get('/oauth', oauth);

init();
