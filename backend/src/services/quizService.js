import Quiz from "../models/Quiz.js";

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

const deleteQuiz = async (quizId) => {
  const quiz = await Quiz.findOne({ _id: quizId, deleted_at: null });
  if (!quiz) throw new Error("Quiz not found");
  quiz.deleted_at = new Date();
  await quiz.save();
  return quiz;
};

const getQuizById = async (quizId) => {
  return Quiz.findOne({ _id: quizId, deleted_at: null });
};

const getQuizzesByQuizSetId = async (quizSetId) => {
  return Quiz.find({ quiz_set_id: quizSetId, deleted_at: null });
};

export default {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getQuizzesByQuizSetId,
};
