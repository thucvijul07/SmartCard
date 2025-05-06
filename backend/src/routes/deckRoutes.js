import express from "express";
import {
  createDeckWithCards,
  updateDeckWithCards,
  getAllDecks,
  getDeckById,
  deleteDeck,
} from "../controllers/deckController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API tạo deck với cards (user)
router.post("/", Auth.UserAuth, createDeckWithCards);

// API lấy tất cả các deck (user)
router.get("/", Auth.UserAuth, getAllDecks);

// API lấy thông tin của một deck theo id (user)
router.get("/:id", Auth.UserAuth, getDeckById);

// API cập nhật deck với cards (user)
router.put("/:id", Auth.UserAuth, updateDeckWithCards);

// API xóa một deck theo id (user)
router.delete("/:id", Auth.UserAuth, deleteDeck);

export default router;
