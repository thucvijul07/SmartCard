import express from "express";
import {
  updateCard,
  generateFlashcards,
} from "../controllers/cardController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API cập nhật card (user)
router.put("/:id", Auth.UserAuth, updateCard);
// API tạo flashcards từ OpenAI
router.post("/generate", Auth.UserAuth, generateFlashcards);

export default router;
