import mongoose from "mongoose";
import Card from "../models/Card.js";
import ReviewLog from "../models/ReviewLog.js";
import Deck from "../models/Deck.js";
import {
  createEmptyCard,
  generatorParameters,
  fsrs,
  Rating,
  State,
} from "ts-fsrs";

const fsrsInstance = fsrs(
  generatorParameters({ enable_fuzz: true, enable_short_term: true })
);

const updateCard = async (userId, id, data) => {
  const updatedCard = await Card.findOneAndUpdate(
    { _id: id, user_id: userId, deleted_at: null },
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

const getCardsToReviewService = async (
  userId,
  deckId,
  now = new Date(),
  maxNew = 20
) => {
  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    return [];
  }
  const deckObjectId = new mongoose.Types.ObjectId(deckId);
  const nowDate = new Date(now);
  const startOfToday = new Date(nowDate);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(nowDate);
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Learning cards: state = 1, due <= endOfToday
  const learningCards = await Card.find({
    user_id: userId,
    deck_id: deckObjectId,
    state: 1,
    due: { $lte: endOfToday },
    deleted_at: null,
  }).sort({ due: 1 });

  // 2. Review cards: state = 2, due <= now
  const reviewCards = await Card.find({
    user_id: userId,
    deck_id: deckObjectId,
    state: 2,
    due: { $lte: nowDate },
    deleted_at: null,
  }).sort({ due: 1 });

  // 3. New cards: state = 0, chưa từng review, sort by created_at, limit maxNew
  const newCardIds = await Card.aggregate([
    {
      $match: {
        user_id: userId,
        deck_id: deckObjectId,
        state: 0,
        deleted_at: null,
      },
    },
    {
      $lookup: {
        from: "reviewlogs",
        let: { cardId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$card_id", "$$cardId"] },
                  { $eq: ["$user_id", userId] },
                ],
              },
            },
          },
        ],
        as: "logs",
      },
    },
    { $match: { logs: { $size: 0 } } },
    { $sort: { created_at: 1 } },
    { $limit: maxNew },
    { $project: { _id: 1 } },
  ]);
  const newCardIdList = newCardIds.map((c) => c._id);
  const newCards = await Card.find({ _id: { $in: newCardIdList } }).sort({
    created_at: 1,
  });

  // Kết hợp đúng thứ tự: learning → review → new
  const allCards = [...learningCards, ...reviewCards, ...newCards];

  // For each card, calculate nextDueTimes for each rating using ts-fsrs
  const cardsWithNextDue = allCards.map((card) => {
    // Chuyển đổi dữ liệu card sang dạng phù hợp cho ts-fsrs
    const cardInput = {
      due: card.due || nowDate,
      stability: card.stability || 0,
      difficulty: card.difficulty || 0,
      elapsed_days: card.elapsed_days || 0,
      scheduled_days: card.scheduled_days || 0,
      learning_steps: card.learningStep || 0,
      reps: card.reps || 0,
      lapses: card.lapses || 0,
      state: card.state ?? State.New,
      last_review: card.last_review || null,
    };
    const scheduling = fsrsInstance.repeat(cardInput, nowDate);
    const nextDueTimes = {
      Again: scheduling[Rating.Again].card.due.toISOString(),
      Hard: scheduling[Rating.Hard].card.due.toISOString(),
      Good: scheduling[Rating.Good].card.due.toISOString(),
      Easy: scheduling[Rating.Easy].card.due.toISOString(),
    };
    const cardObj = card.toObject();
    cardObj.nextDueTimes = nextDueTimes;
    return cardObj;
  });
  return cardsWithNextDue;
};

// Service to update the review result of a card
const updateReviewResultService = async (userId, cardData) => {
  const cardId = cardData._id || cardData.id;
  if (!cardId) throw new Error("Card id is required");
  const card = await Card.findOne({
    _id: cardId,
    user_id: userId,
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const review_time = cardData.last_review
    ? new Date(cardData.last_review)
    : new Date();
  // Chuẩn hóa dữ liệu card cho ts-fsrs
  const cardInput = {
    due: card.due || review_time,
    stability: card.stability || 0,
    difficulty: card.difficulty || 0,
    elapsed_days: card.elapsed_days || 0,
    scheduled_days: card.scheduled_days || 0,
    learning_steps: card.learningStep || 0,
    reps: card.reps || 0,
    lapses: card.lapses || 0,
    state: card.state ?? State.New,
    last_review: card.last_review || null,
  };
  // Tính toán trạng thái mới sau review
  const result = fsrsInstance.next(cardInput, review_time, cardData.rating);
  const newCard = result.card;

  card.difficulty = newCard.difficulty;
  card.stability = newCard.stability;
  card.scheduled_days = newCard.scheduled_days;
  card.elapsed_days = newCard.elapsed_days;
  card.state = newCard.state;
  card.last_review = review_time;
  card.due = newCard.due;
  card.learningStep = newCard.learning_steps;
  card.reps = newCard.reps;
  card.lapses = newCard.lapses;
  await card.save();

  const reviewLog = new ReviewLog({
    card_id: card._id,
    user_id: userId,
    deck_id: card.deck_id,
    difficulty: newCard.difficulty,
    due: newCard.due,
    elapsed_days: newCard.elapsed_days,
    last_elapsed_days: cardData.last_elapsed_days || 0,
    rating: cardData.rating,
    review: review_time,
    scheduled_days: newCard.scheduled_days,
    stability: newCard.stability,
    state: newCard.state,
    learning_steps: newCard.learning_steps,
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
    review: {
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

// Lấy tất cả card của 1 deck (không xóa mềm) và trả về cả title, description
const getCardsByDeckIdService = async (userId, deckId) => {
  if (!mongoose.Types.ObjectId.isValid(deckId)) {
    return { title: "", description: "", cards: [] };
  }
  const deck = await Deck.findOne({
    _id: deckId,
    user_id: userId,
    deleted_at: null,
  });
  if (!deck) {
    return { title: "", description: "", cards: [] };
  }
  const cards = await Card.find({
    user_id: userId,
    deck_id: deckId,
    deleted_at: null,
  }).sort({ created_at: 1 });
  return {
    title: deck.name,
    description: deck.description,
    cards,
  };
};

// Xóa mềm card và reviewlog liên quan
const softDeleteCardService = async (userId, cardId) => {
  // Xóa mềm card
  await Card.findOneAndUpdate(
    { _id: cardId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  // Xóa mềm reviewlog liên quan
  await ReviewLog.updateMany(
    { card_id: cardId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
};

// Xóa mềm card
const deleteCard = async (userId, cardId) => {
  await Card.findOneAndUpdate(
    { _id: cardId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
};

export {
  updateCard,
  getCardsToReviewService,
  updateReviewResultService,
  getReviewStatsService,
  deleteCard,
  getCardsByDeckIdService,
  softDeleteCardService,
};
