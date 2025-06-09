import express from "express";
import {
  getStatistics,
  getStudyDays,
} from "../controllers/statisticsController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API thống kê tổng số deck, số thẻ đã học, số bài kiểm tra đã làm
router.get("/", Auth.UserAuth, getStatistics);
// API trả về mảng ngày user có học (heatmap)
router.get("/study-days", Auth.UserAuth, getStudyDays);

export default router;
