import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quiz_set_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizSet",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correct_answer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default mongoose.model("Quiz", quizSchema);
