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

export { updateCard, generateFlashcards };
