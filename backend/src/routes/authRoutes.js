import express from "express";
import { body, validationResult } from "express-validator";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passport.js";
import { register, login } from "../controllers/authController.js";
import { secret } from "../config/jwt.js";

const router = express.Router();

const validateRegister = [
  body("username").notEmpty().withMessage("Tên người dùng không được để trống"),
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("birthday").isISO8601().withMessage("Ngày sinh không hợp lệ"),
];

function generateToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, secret, {
    expiresIn: "48h",
  });
}

router.post(
  "/register",
  validateRegister,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        is_success: false,
        error: errors.array(),
      });
    }
    next();
  },
  register
);

router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const token = generateToken(req.user); // tạo JWT token từ user
    res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
  }
);
export default router;
