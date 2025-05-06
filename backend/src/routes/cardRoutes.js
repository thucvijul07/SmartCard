import express from "express";
import { updateCard } from "../controllers/cardController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

// API cập nhật card (user)
router.put("/:id", Auth.UserAuth, updateCard);

export default router;
