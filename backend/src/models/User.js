import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar_url: {
    type: String
  },
  password_hash: {
    type: String,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  },
  role: {
    type: Number,
    enum: [0, 1], // 0: user, 1: admin
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);
