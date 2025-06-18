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
    due: { $lte: endOfToday },
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
    // Helper kiểm tra date hợp lệ
    function safeToISOString(date) {
      return date instanceof Date && !isNaN(date) ? date.toISOString() : null;
    }
    const nextDueTimes = {
      Again: safeToISOString(scheduling[Rating.Again].card.due),
      Hard: safeToISOString(scheduling[Rating.Hard].card.due),
      Good: safeToISOString(scheduling[Rating.Good].card.due),
      Easy: safeToISOString(scheduling[Rating.Easy].card.due),
    };
    const cardObj = card.toObject();
    cardObj.nextDueTimes = nextDueTimes;
    return cardObj;
  });
  return cardsWithNextDue;
};

const LEARNING_STEPS = [1, 10];

const updateReviewResultService = async (userId, cardData) => {
  const cardId = cardData._id || cardData.id;
  if (!cardId) throw new Error("Card id is required");
  const card = await Card.findOne({
    _id: cardId,
    user_id: userId,
    deleted_at: null,
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const now = new Date();
  let review_time = cardData.last_review ? new Date(cardData.last_review) : now;
  let rating = cardData.rating;

  // Helper: tạo input chuẩn cho FSRS từ card thực tế
  function makeFSRSInput(card, now, stateOverride) {
    const input = createEmptyCard();
    input.due = card.due instanceof Date && !isNaN(card.due) ? card.due : now;
    input.stability = isNaN(card.stability) ? 0 : card.stability || 0;
    input.difficulty = isNaN(card.difficulty) ? 0 : card.difficulty || 0;
    input.elapsed_days = isNaN(card.elapsed_days) ? 0 : card.elapsed_days || 0;
    input.scheduled_days = isNaN(card.scheduled_days)
      ? 0
      : card.scheduled_days || 0;
    input.learning_steps = isNaN(card.learningStep)
      ? 0
      : card.learningStep || 0;
    input.reps = isNaN(card.reps) ? 0 : card.reps || 0;
    input.lapses = isNaN(card.lapses) ? 0 : card.lapses || 0;
    input.state =
      typeof stateOverride === "number"
        ? stateOverride
        : card.state ?? State.New;
    input.last_review = card.last_review || null;
    return input;
  }

  // Nếu là New card
  if (card.state === 0) {
    card.state = 1;
    card.learningStep = 0;
    card.due = new Date(now.getTime() + LEARNING_STEPS[0] * 60000);
  }
  // Nếu là Learning card
  else if (card.state === 1) {
    if (rating === 1) {
      card.learningStep = 0;
      card.due = new Date(now.getTime() + LEARNING_STEPS[0] * 60000);
    } else {
      card.learningStep += 1;
      if (card.learningStep >= LEARNING_STEPS.length) {
        card.state = 2;
        card.learningStep = 0;
        // Sử dụng createEmptyCard để tạo input chuẩn cho FSRS
        const cardInput = makeFSRSInput(card, now, 2);
        const result = fsrsInstance.next(cardInput, now, rating);
        if (result.card.due instanceof Date && !isNaN(result.card.due)) {
          card.due = result.card.due;
        }
        card.stability = isNaN(result.card.stability)
          ? 0
          : result.card.stability;
        card.difficulty = isNaN(result.card.difficulty)
          ? 0
          : result.card.difficulty;
        card.scheduled_days = isNaN(result.card.scheduled_days)
          ? 0
          : result.card.scheduled_days;
        card.elapsed_days = isNaN(result.card.elapsed_days)
          ? 0
          : result.card.elapsed_days;
        card.reps = isNaN(result.card.reps) ? 0 : result.card.reps;
        card.lapses = isNaN(result.card.lapses) ? 0 : result.card.lapses;
      } else {
        card.due = new Date(
          now.getTime() + LEARNING_STEPS[card.learningStep] * 60000
        );
      }
    }
  }
  // Nếu là Review card
  else if (card.state === 2) {
    if (rating === 1) {
      card.state = 1;
      card.learningStep = 0;
      card.lapses += 1;
      card.due = new Date(now.getTime() + LEARNING_STEPS[0] * 60000);
    } else {
      // Sử dụng createEmptyCard để tạo input chuẩn cho FSRS
      const cardInput = makeFSRSInput(card, now, 2);
      const result = fsrsInstance.next(cardInput, now, rating);
      if (result.card.due instanceof Date && !isNaN(result.card.due)) {
        card.due = result.card.due;
      }
      card.stability = isNaN(result.card.stability) ? 0 : result.card.stability;
      card.difficulty = isNaN(result.card.difficulty)
        ? 0
        : result.card.difficulty;
      card.scheduled_days = isNaN(result.card.scheduled_days)
        ? 0
        : result.card.scheduled_days;
      card.elapsed_days = isNaN(result.card.elapsed_days)
        ? 0
        : result.card.elapsed_days;
      card.reps = isNaN(result.card.reps) ? 0 : result.card.reps;
      card.lapses = isNaN(result.card.lapses) ? 0 : result.card.lapses;
    }
  }

  card.last_review = now;
  await card.save();

  // Lưu log
  const reviewLog = new ReviewLog({
    card_id: card._id,
    user_id: userId,
    deck_id: card.deck_id,
    difficulty: card.difficulty,
    due: card.due,
    elapsed_days: card.elapsed_days,
    last_elapsed_days: cardData.last_elapsed_days || 0,
    rating: rating,
    review: now,
    scheduled_days: card.scheduled_days,
    stability: card.stability,
    state: card.state,
    learning_steps: card.learningStep,
  });

  await reviewLog.save();

  return card;
};

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

const softDeleteCardService = async (userId, cardId) => {
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

// Reset tất cả thẻ trong deck về trạng thái New
const resetAllCardsToNewService = async (userId, deckId) => {
  if (!mongoose.Types.ObjectId.isValid(deckId)) return;
  await Card.updateMany(
    { user_id: userId, deck_id: deckId, deleted_at: null },
    {
      $set: {
        state: 0,
        learningStep: 0,
        stability: 0,
        difficulty: 0,
        scheduled_days: 0,
        elapsed_days: 0,
        reps: 0,
        lapses: 0,
        last_review: null,
        due: new Date(),
      },
    }
  );
  // Xóa mềm toàn bộ reviewlog liên quan
  await ReviewLog.updateMany(
    { user_id: userId, deck_id: deckId, deleted_at: null },
    { deleted_at: new Date() }
  );
};

export {
  updateCard,
  getCardsToReviewService,
  updateReviewResultService,
  getReviewStatsService,
  getCardsByDeckIdService,
  softDeleteCardService,
  resetAllCardsToNewService,
};
