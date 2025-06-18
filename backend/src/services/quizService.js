import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import QuizSet from "../models/QuizSet.js";

const createQuiz = async ({
  user_id,
  quiz_set_id,
  question,
  options,
  correct_answer,
  explanation = "",
}) => {
  if (!user_id || !quiz_set_id || !question || !options || !correct_answer) {
    throw new Error("Missing required fields");
  }
  const quiz = new Quiz({
    user_id,
    quiz_set_id,
    question,
    options,
    correct_answer,
    explanation,
  });
  await quiz.save();
  return quiz;
};

// Lấy tất cả quiz của quizset (dùng cho edit)
const getQuizSetWithQuestionsForEdit = async (quizSetId, userId) => {
  const quizSet = await QuizSet.findOne({
    _id: quizSetId,
    user_id: userId,
    deleted_at: null,
  });
  if (!quizSet) return null;
  const quizzes = await Quiz.find({
    quiz_set_id: quizSetId,
    user_id: userId,
    deleted_at: null,
  });
  return {
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
};
const getQuizzesByQuizSetId = async (quizSetId) => {
  return Quiz.find({ quiz_set_id: quizSetId, deleted_at: null });
};
// Xóa mềm quiz và quizattempt liên quan
const softDeleteQuiz = async (quizId, userId) => {
  await Quiz.findOneAndUpdate(
    { _id: quizId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  await QuizAttempt.updateMany(
    { quiz_id: quizId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
};

export default {
  createQuiz,
  getQuizSetWithQuestionsForEdit,
  softDeleteQuiz,
  getQuizzesByQuizSetId,
};
