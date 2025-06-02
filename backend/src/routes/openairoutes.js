import express from "express";
import { generateText } from "../controllers/openaiController.js";

const router = express.Router();

router.post("/generate-text", generateText);

export default router;
