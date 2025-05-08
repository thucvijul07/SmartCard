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
const getCardsToReviewService = async (userId) => {
  const now = new Date();
  return await Card.find({
    userId,
    nextReview: { $lte: now },
  });
};

// Service to update the review result of a card
const updateReviewResultService = async (
  userId,
  cardId,
  quality,
  timestamp
) => {
  const card = await Card.findOne({ _id: cardId, userId });
  if (!card) {
    throw new Error("Card not found");
  }

  // Update card properties based on quality
  card.reviews += 1;
  switch (quality) {
    case "again":
      card.interval = 1;
      card.ease = Math.max(1.3, card.ease - 0.2);
      card.box = 0;
      break;
    case "hard":
      card.interval = Math.round(card.interval * 1.2);
      card.ease = Math.max(1.3, card.ease - 0.15);
      card.box = Math.min(5, card.box + 1);
      break;
    case "good":
      card.interval = Math.round(card.interval * card.ease);
      card.box = Math.min(5, card.box + 1);
      break;
    case "easy":
      card.interval = Math.round(card.interval * card.ease * 1.3);
      card.ease += 0.15;
      card.box = Math.min(5, card.box + 2);
      break;
  }

  // Calculate next review date
  const nextReview = new Date(timestamp);
  nextReview.setMinutes(nextReview.getMinutes() + card.interval);
  card.nextReview = nextReview;

  await card.save();
  return card;
};

// Service to get review statistics
const getReviewStatsService = async (userId) => {
  const now = new Date();
  const totalCards = await Card.countDocuments({ userId });
  const dueToday = await Card.countDocuments({
    userId,
    nextReview: { $lte: now },
  });
  const reviewedToday = await ReviewLog.countDocuments({
    userId,
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
