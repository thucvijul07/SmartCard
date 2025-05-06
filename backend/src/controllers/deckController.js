import * as deckService from "../services/deckService.js";

const getAllDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    const decks = await deckService.getAllDecksService(userId);
    res.status(200).json(decks);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách deck",
      error: err.message,
    });
  }
};

const getDeckById = async (req, res) => {
  try {
    const userId = req.user._id;
    const deckId = req.params.id;
    const deck = await deckService.getDeckByIdService(userId, deckId);

    if (!deck) {
      return res.status(404).json({ message: "Không tìm thấy deck" });
    }

    res.status(200).json(deck);
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết deck",
      error: err.message,
    });
  }
};

const createDeckWithCards = async (req, res) => {
  try {
    const { name, description, cards } = req.body;
    const userId = req.user._id;

    const { deck, savedCards } = await deckService.createDeckWithCardsService(
      userId,
      name,
      description,
      cards
    );

    res.status(201).json({
      message: "Tạo deck và cards thành công",
      deck,
      cards: savedCards,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi tạo deck và cards",
      error: err.message,
    });
  }
};

const updateDeckWithCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const deckId = req.params.id;
    const { name, description, cards } = req.body;

    // Kiểm tra nếu deck không tồn tại
    const result = await deckService.updateDeckWithCardsService(
      userId,
      deckId,
      name,
      description,
      cards
    );

    if (!result) {
      return res.status(404).json({
        message: "Không tìm thấy deck để cập nhật",
      });
    }

    res.status(200).json({
      message: "Cập nhật deck và cards thành công",
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi cập nhật deck và cards",
      error: err.message,
    });
  }
};

const deleteDeck = async (req, res) => {
  try {
    const userId = req.user._id;
    const deckId = req.params.id;

    const result = await deckService.deleteDeckService(userId, deckId);

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy deck để xóa" });
    }

    res.status(200).json({ message: "Xóa deck thành công" });
  } catch (err) {
    res.status(500).json({
      message: "Lỗi khi xóa deck",
      error: err.message,
    });
  }
};

export {
  createDeckWithCards,
  updateDeckWithCards,
  getAllDecks,
  getDeckById,
  deleteDeck,
};
