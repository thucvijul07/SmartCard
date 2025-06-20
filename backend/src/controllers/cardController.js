import * as cardService from "../services/cardService.js";
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
    const { deckId } = req.query;
    const now = new Date();

    if (!deckId) {
      return res.status(400).json({ message: "Thiếu deckId" });
    }

    // Fetch cards with due date <= today and matching deckId
    const cards = await cardService.getCardsToReviewService(
      userId,
      deckId,
      now
    );

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
    const { cards } = req.body;
    const userId = req.user._id;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Update each card and insert review logs
    const updatedCards = await Promise.all(
      cards.map((card) => cardService.updateReviewResultService(userId, card))
    );

    res.status(200).json({
      is_success: true,
      data: updatedCards,
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
    const { deckId } = req.query; // Lấy deckId từ query params

    if (!deckId) {
      return res.status(400).json({ message: "Thiếu deckId" });
    }

    const stats = await cardService.getReviewStatsService(userId, deckId);

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

const getCardsByDeckId = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deckId } = req.params;
    if (!deckId) {
      return res.status(400).json({ message: "Thiếu deckId" });
    }
    const result = await cardService.getCardsByDeckIdService(userId, deckId);
    res.status(200).json({ is_success: true, ...result });
  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: "Không thể lấy danh sách thẻ",
      error: err.message,
    });
  }
};

const softDeleteCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Thiếu card id" });
    }
    await cardService.softDeleteCardService(userId, id);
    res
      .status(200)
      .json({ is_success: true, message: "Đã xóa thẻ thành công" });
  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: "Không thể xóa thẻ",
      error: err.message,
    });
  }
};

const resetAllCardsToNew = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deckId } = req.body;
    if (!deckId) {
      return res.status(400).json({ message: "Thiếu deckId" });
    }
    await cardService.resetAllCardsToNewService(userId, deckId);
    res.status(200).json({ is_success: true, message: "Reset thành công" });
  } catch (err) {
    res.status(500).json({
      is_success: false,
      message: "Không thể reset thẻ về trạng thái New",
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
  getCardsByDeckId,
  softDeleteCard,
  resetAllCardsToNew,
};
