import Deck from "../models/Deck.js";
import Card from "../models/Card.js";
import ReviewLog from "../models/ReviewLog.js";
import QuizSet from "../models/QuizSet.js";
import Quiz from "../models/Quiz.js";
import openaiService from "./openaiService.js";

export const getAllDecksService = async (userId) => {
  const decks = await Deck.find({ user_id: userId, deleted_at: null }).sort({
    created_at: -1,
  });
  const deckWithCardCounts = await Promise.all(
    decks.map(async (deck) => {
      const cardCount = await Card.countDocuments({
        deck_id: deck._id,
        user_id: userId,
        deleted_at: null,
      });

      return {
        id: deck._id,
        name: deck.name,
        description: deck.description,
        parent_deck_id: deck.parent_deck_id,
        card_count: cardCount,
      };
    })
  );

  return deckWithCardCounts;
};

export const getDeckByIdService = async (userId, deckId) => {
  const deck = await Deck.findOne({
    _id: deckId,
    user_id: userId,
    deleted_at: null,
  });
  if (!deck) return null;

  const cards = await Card.find({
    deck_id: deckId,
    user_id: userId,
    deleted_at: null,
  });

  return {
    deck,
    cards,
  };
};

export const createDeckWithCardsService = async (
  userId,
  name,
  description,
  cards
) => {
  // 1. Tạo deck
  const newDeck = new Deck({
    user_id: userId,
    name,
    description,
  });
  const savedDeck = await newDeck.save();

  // 2. Tạo card
  const now = new Date();
  now.setHours(23, 59, 0, 0);
  const cardDocs = cards.map((card) => ({
    deck_id: savedDeck._id,
    user_id: userId,
    question: card.question,
    answer: card.answer,
    due: now,
  }));
  const savedCards = await Card.insertMany(cardDocs);

  // 3. Tạo QuizSet liên kết deck
  const quizSet = new QuizSet({
    title: name,
    description: description || "",
    user_id: userId,
  });
  const savedQuizSet = await quizSet.save();

  // 4. Gọi sinh quiz từ flashcard (không chờ, chạy async, không ảnh hưởng phản hồi FE)
  (async () => {
    try {
      const flashcards = savedCards.map((c) => ({
        question: c.question,
        answer: c.answer,
      }));
      const quizzes = await openaiService.generateQuizzesFromCards(flashcards);
      if (Array.isArray(quizzes) && quizzes.length > 0) {
        const quizDocs = quizzes.map((q) => ({
          user_id: userId,
          quiz_set_id: savedQuizSet._id,
          question: q.question,
          options: Object.values(q.options),
          correct_answer: q.options[q.correctAnswer],
          explanation: q.explanation || "",
        }));
        await Quiz.insertMany(quizDocs);
      }
    } catch (e) {
      console.error("[Async Quiz Generation Error]", e);
    }
  })();

  return {
    deck: savedDeck,
    savedCards,
    quizSet: savedQuizSet,
    quizzes: [],
  };
};

export const updateDeckWithCardsService = async (
  userId,
  deckId,
  name,
  description,
  cards
) => {
  // Cập nhật deck
  const updatedDeck = await Deck.findOneAndUpdate(
    { _id: deckId, user_id: userId, deleted_at: null },
    { name, description },
    { new: true }
  );

  if (!updatedDeck)
    throw new Error("Deck không tồn tại hoặc không thuộc người dùng");

  // Lấy danh sách card hiện tại của deck
  const currentCards = await Card.find({
    deck_id: deckId,
    user_id: userId,
    deleted_at: null,
  });
  const currentCardIds = currentCards.map((c) => c._id.toString());
  const incomingCardIds = cards
    .filter((c) => c._id)
    .map((c) => c._id.toString());

  // Xóa mềm các card không còn trong danh sách gửi lên
  const cardsToDelete = currentCardIds.filter(
    (id) => !incomingCardIds.includes(id)
  );
  if (cardsToDelete.length > 0) {
    await Card.updateMany(
      {
        _id: { $in: cardsToDelete },
        user_id: userId,
        deck_id: deckId,
        deleted_at: null,
      },
      { deleted_at: new Date() }
    );
    await ReviewLog.updateMany(
      { card_id: { $in: cardsToDelete }, user_id: userId, deleted_at: null },
      { deleted_at: new Date() }
    );
  }

  const updatedCards = [];
  const newCards = [];

  for (const card of cards) {
    if (card._id) {
      // Cập nhật card cũ
      const updatedCard = await Card.findOneAndUpdate(
        { _id: card._id, user_id: userId, deck_id: deckId, deleted_at: null },
        {
          question: card.question,
          answer: card.answer,
        },
        { new: true }
      );
      if (updatedCard) updatedCards.push(updatedCard);
    } else {
      // Tạo card mới
      newCards.push({
        deck_id: deckId,
        user_id: userId,
        question: card.question,
        answer: card.answer,
      });
    }
  }

  const insertedCards =
    newCards.length > 0 ? await Card.insertMany(newCards) : [];

  return {
    deck: updatedDeck,
    updatedCards,
    newCards: insertedCards,
  };
};

export const deleteDeckService = async (userId, deckId) => {
  const deck = await Deck.findOneAndUpdate(
    { _id: deckId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );
  if (!deck) return null;
  await Card.updateMany(
    { deck_id: deckId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  await ReviewLog.updateMany(
    { deck_id: deckId, user_id: userId, deleted_at: null },
    { deleted_at: new Date() }
  );
  return true;
};
