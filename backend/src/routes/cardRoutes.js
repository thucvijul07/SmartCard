import express from "express";
import {
  updateCard,
  generateFlashcards,
  getCardsToReview,
  updateReviewResult,
  getReviewStats,
  getCardsByDeckId,
  softDeleteCard,
} from "../controllers/cardController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API cập nhật card (user)
router.put("/:id", Auth.UserAuth, updateCard);
// API tạo flashcards từ OpenAI
router.post("/generate", Auth.UserAuth, generateFlashcards);

// API lấy danh sách thẻ để ôn tập (user)
router.get("/review", Auth.UserAuth, getCardsToReview);

// API cập nhật kết quả ôn tập (user)
router.post("/review", Auth.UserAuth, updateReviewResult);

// API lấy thống kê ôn tập (user)
router.get("/stats", Auth.UserAuth, getReviewStats);

// API lấy tất cả card của 1 deck (user)
router.get("/by-deck/:deckId", Auth.UserAuth, getCardsByDeckId);
// API xóa mềm card (user)
router.delete("/:id", Auth.UserAuth, softDeleteCard);

export default router;
