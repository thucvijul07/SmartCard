import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "express-async-errors";

import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import openaiRoutes from "./routes/openairoutes.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cards", cardRoutes);
app.use("/api/v1/decks", deckRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/openai", openaiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Lỗi server" });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
  }
};

start();
