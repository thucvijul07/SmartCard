import openaiService from "../services/openaiService.js";
import quizService from "../services/quizService.js";
import QuizSet from "../models/QuizSet.js";

const generateQuizzes = async (req, res) => {
  try {
    const { text, numQA, difficulty } = req.body;

    if (!text || !numQA || !difficulty) {
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
    const user_id = req.user._id || req.user.id;
    const { title, description, questions } = req.body;
    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Missing title or questions" });
    }
    // Tạo QuizSet
    const quizSet = await QuizSet.create({
      title,
      description: description || "",
      user_id,
    });
    // Tạo các quiz liên kết với quizSet
    const created = [];
    for (const q of questions) {
      const quiz = await quizService.createQuiz({
        user_id,
        quiz_set_id: quizSet._id,
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctAnswer],
        explanation: q.explanation,
      });
      created.push(quiz);
    }
    res.status(201).json({ isSuccess: true, quizSet, quizzes: created });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

const getQuizSetDetail = async (req, res) => {
  try {
    const { id } = req.params; // quizSetId
    // Lấy quiz set
    const quizSet = await QuizSet.findOne({ _id: id, deleted_at: null });
    if (!quizSet) {
      return res
        .status(404)
        .json({ isSuccess: false, message: "Quiz set not found" });
    }
    // Lấy các quiz thuộc quiz set này
    const quizzes = await quizService.getQuizzesByQuizSetId(id);
    // Định dạng lại dữ liệu cho phù hợp giao diện take quiz
    const formatted = {
      id: quizSet._id,
      title: quizSet.title,
      description: quizSet.description,
      questions: quizzes.map((q) => ({
        id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.options.findIndex((opt) => opt === q.correct_answer),
        explanation: q.explanation || "",
      })),
    };
    res.status(200).json({ isSuccess: true, data: formatted });
  } catch (error) {
    res.status(500).json({ isSuccess: false, message: error.message });
  }
};

const getQuizSetForEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const data = await quizService.getQuizSetWithQuestionsForEdit(id, userId);
    if (!data) {
      return res
        .status(404)
        .json({ isSuccess: false, message: "Quiz set not found" });
    }
    res.status(200).json({ isSuccess: true, data });
  } catch (error) {
    res.status(500).json({ isSuccess: false, message: error.message });
  }
};

// Xóa mềm quiz và quizattempt liên quan
const softDeleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await quizService.softDeleteQuiz(id, userId);
    res.status(200).json({ isSuccess: true, message: "Quiz deleted" });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

export {
  generateQuizzes,
  createQuiz,
  getQuizSetDetail,
  getQuizSetForEdit,
  softDeleteQuiz,
};
