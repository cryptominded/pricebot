import mongo from "mongodb";
import fetch from "node-fetch";
import SlackSchema from './slackSchema';

const slackUrl = 'https://slack.com/api/oauth.access';
const clientId = process.env.SLACK_CLIENT_ID || '123049391908.294771441188';
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const redirectUri = process.env.SLACK_REDIRECT_URI || 'https://cryptominded-bot.herokuapp.com/';

export default async (req, res) => {
  const code = req.query.code;
	const slackRes = await fetch(`${slackUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`);
  const json = await slackRes.json();

  if (json.ok) {
    const PreviousSlack = await SlackSchema.findOne({teamId: json.team_id});
    if (!PreviousSlack) {
      const SlackApp = new SlackSchema({
        accessToken: json.access_token,
        scope: json.scope,
        userId: json.user_id,
        teamName: json.team_name,
        teamId: json.team_id,
        botUserId: json.bot.bot_user_id,
        botAccessToken: json.bot.bot_access_token
      });
      await SlackApp.save();
      res.send("App was linked successfully");
      spawnBot(SlackApp.botAccessToken);
      console.log(`Connected to: ${SlackApp.teamName} ${SlackApp.teamId}`);
    }
    res.send("App was already linked");    
  } else {
    console.log('Error on oAuth', json);
    res.send(json);
  }
}