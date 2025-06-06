import express from "express";
import {
  generateQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSetDetail,
} from "../controllers/quizController.js";
import {
  submitQuizAttempt,
  getQuizResultBySet,
} from "../controllers/quizAttemptController.js";
import { getAllQuizSetsByUser } from "../controllers/quizSetController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// AI quiz generation
router.post("/generateQuiz", Auth.UserAuth, generateQuizzes);
// CRUD for quiz
router.post("/", Auth.UserAuth, createQuiz);
router.put("/:id", Auth.UserAuth, updateQuiz);
router.delete("/:id", Auth.UserAuth, deleteQuiz);
// Lấy tất cả quiz của user
router.get("/", Auth.UserAuth, getAllQuizSetsByUser);
// Nộp kết quả làm quiz set
router.post("/submit", Auth.UserAuth, submitQuizAttempt);
// Lấy nội dung quiz theo quizSetId
router.get("/set/:id", Auth.UserAuth, getQuizSetDetail);
// Xem kết quả quiz đã làm
router.get("/result/:quiz_set_id", Auth.UserAuth, getQuizResultBySet);

export default router;
