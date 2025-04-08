import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selected_answer: {
    type: String,
    required: true
  },
  is_correct: {
    type: Boolean,
    required: true
  },
  attempt_date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("QuizAttempt", quizAttemptSchema); 