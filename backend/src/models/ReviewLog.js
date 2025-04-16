import mongoose from "mongoose";

const reviewLogSchema = new mongoose.Schema(
  {
    card_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    due: {
      type: Date,
      required: true,
    },
    elapsed_days: {
      type: Number,
      required: true,
    },
    last_elapsed_days: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: Date,
      required: true,
    },
    scheduled_days: {
      type: Number,
      required: true,
    },
    stability: {
      type: Number,
      required: true,
    },
    state: {
      type: Number,
      required: true,
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

export default mongoose.model("ReviewLog", reviewLogSchema);
