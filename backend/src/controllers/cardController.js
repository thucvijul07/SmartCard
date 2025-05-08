import cardService from "../services/cardService.js";
import openaiService from "../services/openaiService.js";

const updateCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedCard = await cardService.updateCard(
      userId,
      req.params.id,
      req.body
    );
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thẻ",
      error: error.message,
    });
  }
};

const generateFlashcards = async (req, res) => {
  try {
    const { text, numCards, difficulty } = req.body;

    if (!text || !numCards || !difficulty) {
      return res.status(400).json({ message: "Thiếu dữ liệu đầu vào" });
    }

    const flashcards = await openaiService.generateFlashcardsWithOpenAI(
      text,
      numCards,
      difficulty
    );

    res.status(200).json({ flashcards });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo flashcards",
      error: error.message,
    });
  }
};

const getCardsToReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const cards = await cardService.getCardsToReviewService(userId);

    res.status(200).json({
      is_success: true,
      data: cards,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      is_success: false,
      message: "Không thể lấy danh sách thẻ để ôn tập",
      error: err.message,
    });
  }
};

const updateReviewResult = async (req, res) => {
  try {
    const { cardId, quality, timestamp } = req.body;
    const userId = req.user._id;

    const updatedCard = await cardService.updateReviewResultService(
      userId,
      cardId,
      quality,
      timestamp
    );

    res.status(200).json({
      is_success: true,
      data: updatedCard,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      is_success: false,
      message: "Không thể cập nhật kết quả ôn tập",
      error: err.message,
    });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await cardService.getReviewStatsService(userId);

    res.status(200).json({
      is_success: true,
      data: stats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      is_success: false,
      message: "Không thể lấy thống kê ôn tập",
      error: err.message,
    });
  }
};

export {
  updateCard,
  generateFlashcards,
  getCardsToReview,
  updateReviewResult,
  getReviewStats,
};
