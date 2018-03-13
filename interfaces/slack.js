import Botkit from "botkit";
import getCommands from "./commands";

const slackController = Botkit.slackbot({ debug: false });

const createBot = token => slackController.spawn({
  token,
  require_delivery: true,
}).startRTM();

const summonKeyword = process.env.DEV ? '\\?cmdev' : '\\?cm';

const slackBot = (token, teamId) => {
  const bot = createBot(token);
  const commands = getCommands(token, teamId);
  commands.forEach(command => {
    slackController.hears(
      summonKeyword + command.keyword,
      command.conditions,
      command.func
    );
  });
  return bot;
};

export default slackBot;
