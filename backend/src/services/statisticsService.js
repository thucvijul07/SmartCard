import Deck from "../models/Deck.js";
import ReviewLog from "../models/ReviewLog.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const getUserStatistics = async (userId) => {
  // Tổng số bộ thẻ (deck)
  const totalDecks = await Deck.countDocuments({
    user_id: userId,
    deleted_at: null,
  });
  // Số thẻ đã học (tổng số bản ghi trong ReviewLog)
  const totalCardsReviewed = await ReviewLog.countDocuments({
    user_id: userId,
    deleted_at: null,
  });
  // Số bài kiểm tra đã làm (tổng số bản ghi trong QuizAttempt)
  const totalQuizAttempts = await QuizAttempt.countDocuments({
    user_id: userId,
    deleted_at: null,
  });

  return {
    totalDecks,
    totalCardsReviewed,
    totalQuizAttempts,
  };
};

export const getUserStudyDays = async (userId, fromDate, toDate) => {
  // Lấy tất cả ngày có review log của user trong khoảng fromDate - toDate
  // Nếu không truyền fromDate/toDate thì lấy 1 năm gần nhất
  const end = toDate ? new Date(toDate) : new Date();
  const start = fromDate
    ? new Date(fromDate)
    : new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());

  // Lấy các ngày có review (chỉ lấy ngày, không lấy giờ)
  const logs = await ReviewLog.aggregate([
    {
      $match: {
        user_id: userId,
        deleted_at: null,
        review: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$review" },
        },
      },
    },
    {
      $project: { _id: 0, date: "$_id" },
    },
  ]);
  // Trả về mảng các ngày dạng yyyy-mm-dd
  return logs.map((l) => l.date);
};
