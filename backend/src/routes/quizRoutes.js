import express from "express";
import {
  generateQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

// AI quiz generation
router.post("/generate", generateQuizzes);
// CRUD for quiz
router.post("/", createQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;
