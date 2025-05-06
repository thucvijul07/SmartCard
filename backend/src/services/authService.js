import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { secret } from "../config/jwt.js";

const isValidEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const register = async ({ username, email, password, birthday }) => {
  if (!username || !email || !password || !birthday) {
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  if (!isValidEmail(email)) {
    throw new Error("Email không hợp lệ");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new Error("Username đã được sử dụng");
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

  return {
    message: "Đăng ký thành công",
    token,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  if (!isValidEmail(email)) {
    throw new Error("Email không hợp lệ");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không chính xác");
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, secret, {
    expiresIn: "48h",
  });

  return {
    role: user.role,
    avatar_url: user.avatar_url,
    token,
  };
};

const logout = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  return {
    message: "Đăng xuất thành công",
  };
};

export const authService = {
  register,
  login,
  logout,
};
