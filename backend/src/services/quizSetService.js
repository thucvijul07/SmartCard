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

export const softDeleteQuizSetService = async (userId, quizSetId) => {
  // Xóa mềm quiz set
  await QuizSet.findOneAndUpdate(
    { _id: quizSetId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  // Xóa mềm các quiz thuộc quiz set
  const quizzes = await Quiz.find({
    quiz_set_id: quizSetId,
    user_id: userId,
    deleted_at: null,
  });
  const quizIds = quizzes.map((q) => q._id);
  await Quiz.updateMany(
    { quiz_set_id: quizSetId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  // Xóa mềm các quizattempt liên quan
  if (quizIds.length > 0) {
    await QuizAttempt.updateMany(
      { quiz_id: { $in: quizIds }, user_id: userId, deleted_at: null },
      { deleted_at: new Date() }
    );
  }
};

export const updateQuizSetWithQuestionsService = async (
  userId,
  quizSetId,
  title,
  description,
  questions
) => {
  // 1. Update quizset info
  const quizSet = await QuizSet.findOne({
    _id: quizSetId,
    user_id: userId,
    deleted_at: null,
  });
  if (!quizSet) throw new Error("QuizSet not found");
  quizSet.title = title;
  quizSet.description = description;
  await quizSet.save();

  // 2. Lấy danh sách quiz cũ
  const oldQuizzes = await Quiz.find({
    quiz_set_id: quizSetId,
    user_id: userId,
    deleted_at: null,
  });
  const oldQuizIds = oldQuizzes.map((q) => q._id.toString());

  // 3. Xử lý từng quiz trong request
  const incomingQuizIds = [];
  for (const q of questions) {
    if (q.id && !q.id.toString().startsWith("new-")) {
      // Update quiz cũ
      await Quiz.findOneAndUpdate(
        { _id: q.id, quiz_set_id: quizSetId, user_id: userId },
        {
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          deleted_at: null,
        }
      );
      incomingQuizIds.push(q.id.toString());
    } else {
      // Tạo quiz mới
      const newQuiz = await Quiz.create({
        user_id: userId,
        quiz_set_id: quizSetId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      });
      incomingQuizIds.push(newQuiz._id.toString());
    }
  }

  // 4. Xóa mềm quiz không còn trong danh sách
  for (const oldId of oldQuizIds) {
    if (!incomingQuizIds.includes(oldId)) {
      await Quiz.findOneAndUpdate(
        { _id: oldId, quiz_set_id: quizSetId, user_id: userId },
        { deleted_at: new Date() }
      );
    }
  }

  return { quizSetId, updated: true };
};
