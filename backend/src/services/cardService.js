import Card from "../models/Card.js";
import ReviewLog from "../models/ReviewLog.js";

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

// Service to get the list of cards to review
const getCardsToReviewService = async (userId, deckId) => {
  return await Card.find({
    user_id: userId,
    deck_id: deckId,
  }).sort({ due: 1 }); // Sắp xếp theo due (gần đến trước, xa đến sau)
};

// Service to update the review result of a card
const updateReviewResultService = async (userId, deckId, cardData) => {
  const card = await Card.findOne({
    _id: cardData.id,
    user_id: userId,
    deck_id: deckId,
  });

  if (!card) {
    throw new Error("Card not found");
  }

  // Update card properties
  card.stability = cardData.stability;
  card.difficulty = cardData.difficulty;
  card.scheduled_days = cardData.scheduled_days;
  card.elapsed_days = cardData.elapsed_days;
  card.state = cardData.state;
  card.last_review = cardData.last_review;
  card.due = cardData.due;

  await card.save();

  // Insert a new review log
  const reviewLog = new ReviewLog({
    card_id: card._id,
    user_id: userId,
    difficulty: cardData.difficulty,
    due: cardData.due,
    elapsed_days: cardData.elapsed_days,
    last_elapsed_days: cardData.last_elapsed_days || 0, // Default to 0 if not provided
    rating: cardData.rating, // Assuming rating is passed in cardData
    review: cardData.last_review,
    scheduled_days: cardData.scheduled_days,
    stability: cardData.stability,
    state: cardData.state,
  });

  await reviewLog.save();

  return card;
};

// Service to get review statistics
const getReviewStatsService = async (userId, deckId) => {
  const now = new Date();
  const totalCards = await Card.countDocuments({
    user_id: userId,
    deck_id: deckId,
  });
  const dueToday = await Card.countDocuments({
    user_id: userId,
    deck_id: deckId,
    due: { $lte: now },
  });
  const reviewedToday = await ReviewLog.countDocuments({
    user_id: userId,
    deck_id: deckId,
    timestamp: {
      $gte: new Date(now.setHours(0, 0, 0, 0)),
      $lte: new Date(now.setHours(23, 59, 59, 999)),
    },
  });

  return {
    totalCards,
    dueToday,
    reviewedToday,
  };
};

export {
  updateCard,
  getCardsToReviewService,
  updateReviewResultService,
  getReviewStatsService,
};
