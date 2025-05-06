import cardService from "../services/cardService.js";

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

export { updateCard };
