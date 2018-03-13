
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const slackSchema = new Schema({
  accessToken: String,
  scope: String,
  userId: String,
  teamName: String,
  teamId: String,
  botUserId: String,
  botAccessToken: String,
  alertChannels: {
    type: Array
  }
});

const SlackSchema = mongoose.model('SlackSchema', slackSchema);
export default SlackSchema;