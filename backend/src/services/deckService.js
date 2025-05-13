import Deck from "../models/Deck.js";
import Card from "../models/Card.js";

export const getAllDecksService = async (userId) => {
  const decks = await Deck.find({ user_id: userId });
  const deckWithCardCounts = await Promise.all(
    decks.map(async (deck) => {
      const cardCount = await Card.countDocuments({
        deck_id: deck._id,
        user_id: userId,
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

// Lấy chi tiết 1 deck theo id và bao gồm cả các cards của nó
export const getDeckByIdService = async (userId, deckId) => {
  const deck = await Deck.findOne({ _id: deckId, user_id: userId });
  if (!deck) return null;

  const cards = await Card.find({ deck_id: deckId, user_id: userId });

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
  const newDeck = new Deck({
    user_id: userId,
    name,
    description,
  });
  const savedDeck = await newDeck.save();

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

  return { deck: savedDeck, savedCards };
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
    { _id: deckId, user_id: userId },
    { name, description },
    { new: true }
  );

  if (!updatedDeck)
    throw new Error("Deck không tồn tại hoặc không thuộc người dùng");

  const updatedCards = [];
  const newCards = [];

  for (const card of cards) {
    if (card._id) {
      // Cập nhật card cũ
      const updatedCard = await Card.findOneAndUpdate(
        { _id: card._id, user_id: userId, deck_id: deckId },
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

// Xóa deck và tất cả các cards liên quan
export const deleteDeckService = async (userId, deckId) => {
  const deck = await Deck.findOneAndDelete({ _id: deckId, user_id: userId });
  if (!deck) return null;

  await Card.deleteMany({ deck_id: deckId, user_id: userId });

  return true;
};
