import { getAllQuizSetsByUserService } from "../services/quizSetService.js";

export const getAllQuizSetsByUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await getAllQuizSetsByUserService(userId);
    res.status(200).json({ isSuccess: true, data: result });
  } catch (error) {
    console.error("getAllQuizSetsByUser error:", error);
    res.status(500).json({ isSuccess: false, message: error.message });
  }
};
