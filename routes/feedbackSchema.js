
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  message: String,
  teamId: String,
  userId: String,
});

const FeedbackSchema = mongoose.model('FeedbackSchema', feedbackSchema);
export default FeedbackSchema;