import express from "express";
import {
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { Auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/info", Auth.UserAuth, getUser);
router.put("/info", Auth.UserAuth, updateUser); // cập nhật thông tin user
router.delete("/info", Auth.UserAuth, deleteUser); // xóa user

export default router;
