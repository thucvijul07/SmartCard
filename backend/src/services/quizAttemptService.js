import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";
import QuizSet from "../models/QuizSet.js";

export const submitQuizAttemptService = async (
  user_id,
  quiz_set_id,
  answers
) => {
  if (!quiz_set_id || !Array.isArray(answers) || answers.length === 0) {
    throw new Error("Missing quiz_set_id or answers");
  }

  const uniqueAnswersMap = {};
  for (const ans of answers) {
    if (ans.quiz_id && !uniqueAnswersMap[ans.quiz_id]) {
      uniqueAnswersMap[ans.quiz_id] = ans;
    }
  }
  const uniqueAnswers = Object.values(uniqueAnswersMap);

  const quizzes = await Quiz.find({ quiz_set_id, deleted_at: null });
  const quizMap = {};
  quizzes.forEach((q) => {
    quizMap[q._id.toString()] = q;
  });

  let correctCount = 0;
  const attempts = [];

  for (const ans of uniqueAnswers) {
    const quiz = quizMap[ans.quiz_id];
    if (!quiz) continue;

    const is_correct = quiz.correct_answer === ans.selected_answer;
    if (is_correct) correctCount++;

    const attempt = await QuizAttempt.findOneAndUpdate(
      { quiz_id: quiz._id, user_id },
      {
        selected_answer: ans.selected_answer,
        is_correct,
        deleted_at: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    attempts.push(attempt);
  }

  return {
    correct: correctCount,
    total: attempts.length,
    attempts,
  };
};

export const getQuizResultBySetService = async (user_id, quiz_set_id) => {
  if (!quiz_set_id) throw new Error("Missing quiz_set_id");

  // Lấy quiz set
  const quizSet = await QuizSet.findById(quiz_set_id);
  if (!quizSet) throw new Error("Quiz set not found");

  // Lấy tất cả quiz thuộc quiz_set_id
  const quizzes = await Quiz.find({ quiz_set_id, deleted_at: null });
  // Lấy attempt của user cho quiz_set này
  const attempts = await QuizAttempt.find({
    user_id,
    deleted_at: null,
    quiz_id: { $in: quizzes.map((q) => q._id) },
  });
  const attemptMap = {};
  attempts.forEach((a) => {
    attemptMap[a.quiz_id.toString()] = a;
  });

  let score = 0;
  const questions = quizzes.map((q) => {
    const attempt = attemptMap[q._id.toString()];
    const userAnswer = attempt
      ? q.options.indexOf(attempt.selected_answer)
      : undefined;
    const correctAnswer = q.options.indexOf(q.correct_answer);
    if (userAnswer === correctAnswer) score++;
    return {
      id: q._id.toString(),
      question: q.question,
      options: q.options,
      correctAnswer,
      userAnswer,
      explanation: q.explanation || "",
    };
  });

  // Lấy thời gian hoàn thành (lấy updated_at của attempt cuối cùng)
  let completedAt = null;
  if (attempts.length > 0) {
    completedAt = attempts.reduce(
      (max, a) => (a.updated_at > max ? a.updated_at : max),
      attempts[0].updated_at
    );
  }

  return {
    id: quizSet._id.toString(),
    title: quizSet.title,
    description: quizSet.description,
    questions,
    score,
    totalQuestions: questions.length,
    completedAt,
  };
};
