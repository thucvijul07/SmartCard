import mongoose from "mongoose";

const deckSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Deck", deckSchema); 