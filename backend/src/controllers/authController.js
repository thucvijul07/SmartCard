import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { secret } from "../config/jwt.js";

const isValidEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const register = async (req, res) => {
  try {
    const { username, email, password, birthday } = req.body;

    if (!username || !email || !password || !birthday) {
      return res.status(400).json({
        is_success: false,
        error: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        is_success: false,
        error: "Email không hợp lệ",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        is_success: false,
        error: "Email đã được sử dụng",
      });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        is_success: false,
        error: "Username đã được sử dụng",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password_hash,
      birthday,
      role: 0, 
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, {
      expiresIn: "24h",
    });

    res.status(201).json({
      is_success: true,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      is_success: false,
      error: "Lỗi server trong quá trình đăng ký",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        is_success: false,
        error: "Vui lòng nhập email và mật khẩu",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        is_success: false,
        error: "Email không hợp lệ",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        is_success: false,
        error: "Email hoặc mật khẩu không chính xác",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        is_success: false,
        error: "Email hoặc mật khẩu không chính xác",
      });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, secret, {
      expiresIn: "24h",
    });

    res.json({
      is_success: true,
      data: {
        role: user.role,
        avatar_url: user.avatar_url,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      is_success: false,
      error: "Lỗi server trong quá trình đăng nhập",
    });
  }
};

export { register, login };
