import jwt from "jsonwebtoken";
import { secret } from "../config/jwt.js";
import User from "../models/User.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";

// Middleware xác thực cho người dùng
const UserAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedError("Không có quyền truy cập!");
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new UnauthorizedError("Không tìm thấy người dùng!");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Vui lòng đăng nhập để tiếp tục" });
  }
};

// Middleware xác thực cho admin
const AdminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedError("Không có quyền truy cập!");
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new UnauthorizedError("Không tìm thấy người dùng!");
    }

    if (user.role !== 1) {
      throw new UnauthorizedError("Không có quyền truy cập admin!");
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(401).json({ error: "Vui lòng đăng nhập để tiếp tục" });
    }
  }
};

export const Auth = {
  UserAuth,
  AdminAuth,
};
