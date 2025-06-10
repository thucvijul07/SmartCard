import express from "express";
import {
  generateQuizzes,
  createQuiz,
  getQuizSetDetail,
  getQuizSetForEdit,
  softDeleteQuiz,
} from "../controllers/quizController.js";
import {
  submitQuizAttempt,
  getQuizResultBySet,
} from "../controllers/quizAttemptController.js";
import {
  getAllQuizSetsByUser,
  softDeleteQuizSet,
  updateQuizSet, // Thêm controller updateQuizSet
} from "../controllers/quizSetController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// AI quiz generation
router.post("/generateQuiz", Auth.UserAuth, generateQuizzes);
// CRUD for quiz
router.post("/", Auth.UserAuth, createQuiz);
router.delete("/:id", Auth.UserAuth, softDeleteQuiz);
// Lấy tất cả quiz của user
router.get("/", Auth.UserAuth, getAllQuizSetsByUser);
// Nộp kết quả làm quiz set
router.post("/submit", Auth.UserAuth, submitQuizAttempt);
// Lấy nội dung quiz theo quizSetId
router.get("/set/:id", Auth.UserAuth, getQuizSetDetail);
// Lấy quizset + quiz cho trang edit
router.get("/edit-set/:id", Auth.UserAuth, getQuizSetForEdit);
// Xem kết quả quiz đã làm
router.get("/result/:quiz_set_id", Auth.UserAuth, getQuizResultBySet);
// Xóa mềm quiz set (và quiz, quizattempt liên quan)
router.delete("/set/:id", Auth.UserAuth, softDeleteQuizSet);
// Cập nhật quiz set (title, description, thêm/sửa/xóa quiz nhỏ)
router.put("/set/:id", Auth.UserAuth, updateQuizSet);

export default router;
