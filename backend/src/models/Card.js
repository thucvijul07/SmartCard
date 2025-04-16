import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    deck_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      default: 0,
    },
    due: {
      type: Date,
    },
    elapsed_days: {
      type: Number,
      default: 0,
    },
    lapses: {
      type: Number,
      default: 0,
    },
    last_review: {
      type: Date,
    },
    reps: {
      type: Number,
      default: 0,
    },
    scheduled_days: {
      type: Number,
      default: 0,
    },
    stability: {
      type: Number,
      default: 0,
    },
    state: {
      type: Number,
      default: 0,
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

export default mongoose.model("Card", cardSchema);
