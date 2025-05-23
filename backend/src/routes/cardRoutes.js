import express from "express";
import {
  updateCard,
  generateFlashcards,
  getCardsToReview,
  updateReviewResult,
  getReviewStats,
} from "../controllers/cardController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API cập nhật card (user)
router.put("/:id", Auth.UserAuth, updateCard);
// API tạo flashcards từ OpenAI
router.post("/generate", Auth.UserAuth, generateFlashcards);

// API lấy danh sách thẻ để ôn tập (user)
router.get("/review", Auth.UserAuth, getCardsToReview); // Thêm deckId vào query

// API cập nhật kết quả ôn tập (user)
router.post("/review", Auth.UserAuth, updateReviewResult); // Thêm deckId vào body

// API lấy thống kê ôn tập (user)
router.get("/stats", Auth.UserAuth, getReviewStats); // Thêm deckId vào query

export default router;
