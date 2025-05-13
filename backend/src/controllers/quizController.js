import openaiService from "../services/openaiService.js";
import quizService from "../services/quizService.js";

const generateQuizzes = async (req, res) => {
  try {
    const { text, numQA, difficulty } = req.body;

    if (!text || !numQA || !difficulty || !typeQuiz) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    const quizzes = await openaiService.generateQuizzesWithOpenAI(
      text,
      numQA,
      difficulty
    );
    if (!quizzes || quizzes.length === 0) {
      return res.status(500).json({ message: "Không thể tạo quiz" });
    }
    res.status(200).json({ quizzes });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo quiz",
      error: error.message,
    });
  }
};

const createQuiz = async (req, res) => {
  try {
    const { deck_id, user_id, question, options, correct_answer } = req.body;
    const quiz = await quizService.createQuiz({
      deck_id,
      user_id,
      question,
      options,
      correct_answer,
    });
    res.status(201).json({ isSuccess: true, data: quiz });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const quiz = await quizService.updateQuiz(id, updateData);
    res.status(200).json({ isSuccess: true, data: quiz });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await quizService.deleteQuiz(id);
    res.status(200).json({ isSuccess: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

export { generateQuizzes, createQuiz, updateQuiz, deleteQuiz };
