import QuizSet from "../models/QuizSet.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const getAllQuizSetsByUserService = async (userId) => {
  // Lấy tất cả quiz set của user
  const quizSets = await QuizSet.find({
    user_id: userId,
    deleted_at: null,
  }).lean();

  const quizSetIds = quizSets.map((qs) => qs._id);

  // Lấy tất cả quiz thuộc các quiz set này
  const quizzes = await Quiz.find({
    quiz_set_id: { $in: quizSetIds },
    deleted_at: null,
  }).lean();

  const quizIds = quizzes.map((q) => q._id);

  // Lấy tất cả attempt của user với các quiz này
  const attempts = await QuizAttempt.find({
    user_id: userId,
    quiz_id: { $in: quizIds },
    deleted_at: null,
  }).lean();

  // Gom nhóm dữ liệu
  const quizSetMap = {};
  quizSets.forEach((qs) => {
    quizSetMap[qs._id.toString()] = {
      _id: qs._id,
      title: qs.title,
      description: qs.description,
      created_at: qs.created_at,
      updated_at: qs.updated_at,
      totalQuestions: 0,
      correct: 0,
      attempts: 0,
    };
  });

  quizzes.forEach((q) => {
    const setId = q.quiz_set_id.toString();
    if (quizSetMap[setId]) {
      quizSetMap[setId].totalQuestions++;
    }
  });

  attempts.forEach((a) => {
    const quiz = quizzes.find((q) => q._id.toString() === a.quiz_id.toString());
    if (quiz) {
      const setId = quiz.quiz_set_id.toString();
      if (quizSetMap[setId]) {
        quizSetMap[setId].attempts++;
        if (a.is_correct) quizSetMap[setId].correct++;
      }
    }
  });

  return Object.values(quizSetMap);
};
