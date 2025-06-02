import express from "express";
import {
  generateQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// AI quiz generation
router.post("/generateQuiz", Auth.UserAuth, generateQuizzes);
// CRUD for quiz
router.post("/", Auth.UserAuth, createQuiz);
router.put("/:id", Auth.UserAuth, updateQuiz);
router.delete("/:id", Auth.UserAuth, deleteQuiz);

export default router;
