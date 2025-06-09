import {
  getUserStatistics,
  getUserStudyDays,
} from "../services/statisticsService.js";

export const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await getUserStatistics(userId);
    res.status(200).json({ is_success: true, data: stats });
  } catch (err) {
    res.status(500).json({ is_success: false, message: err.message });
  }
};

export const getStudyDays = async (req, res) => {
  try {
    const userId = req.user._id;
    const { from, to } = req.query;
    const days = await getUserStudyDays(userId, from, to);
    res.status(200).json({ is_success: true, data: days });
  } catch (err) {
    res.status(500).json({ is_success: false, message: err.message });
  }
};
