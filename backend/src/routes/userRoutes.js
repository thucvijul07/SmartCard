import express from "express";
import { getUser } from "../controllers/userController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/info", Auth.UserAuth, getUser);

export default router;
