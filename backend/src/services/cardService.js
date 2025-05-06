import Card from "../models/Card.js";

const updateCard = async (userId, id, data) => {
  const updatedCard = await Card.findOneAndUpdate(
    { _id: id, user_id: userId },
    {
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      due: data.due,
      updated_at: new Date(),
    },
    { new: true }
  );

  if (!updatedCard) {
    throw new Error("Thẻ không tồn tại hoặc không thuộc người dùng");
  }

  return updatedCard;
};

export default {
  updateCard,
};
