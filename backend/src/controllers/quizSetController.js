import {
  getAllQuizSetsByUserService,
  softDeleteQuizSetService,
  updateQuizSetWithQuestionsService,
} from "../services/quizSetService.js";

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

export const softDeleteQuizSet = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    await softDeleteQuizSetService(userId, id);
    res.status(200).json({ isSuccess: true, message: "Quiz set deleted" });
  } catch (error) {
    res.status(500).json({ isSuccess: false, message: error.message });
  }
};

export const updateQuizSet = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { title, description, questions } = req.body;
    const result = await updateQuizSetWithQuestionsService(
      userId,
      id,
      title,
      description,
      questions
    );
    res.status(200).json({ isSuccess: true, data: result });
  } catch (error) {
    res.status(500).json({ isSuccess: false, message: error.message });
  }
};
