import Quiz from "../models/Quiz.js";

const createQuiz = async ({
  deck_id,
  user_id,
  question,
  options,
  correct_answer,
}) => {
  if (!deck_id || !user_id || !question || !options || !correct_answer) {
    throw new Error("Missing required fields");
  }
  const quiz = new Quiz({
    deck_id,
    user_id,
    question,
    options,
    correct_answer,
  });
  await quiz.save();
  return quiz;
};

const updateQuiz = async (quizId, updateData) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.deleted_at) throw new Error("Quiz not found");
  Object.assign(quiz, updateData);
  await quiz.save();
  return quiz;
};

const deleteQuiz = async (quizId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.deleted_at) throw new Error("Quiz not found");
  quiz.deleted_at = new Date();
  await quiz.save();
  return quiz;
};

export default { createQuiz, updateQuiz, deleteQuiz };
