import { authService } from "../services/authService.js";

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      is_success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      is_success: false,
      error: error.message || "Lỗi server trong quá trình đăng ký",
    });
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({
      is_success: true,
      data,
    });
  } catch (error) {
    res.status(401).json({
      is_success: false,
      error: error.message || "Lỗi server trong quá trình đăng nhập",
    });
  }
};

const logout = async (req, res) => {
  try {
    const result = await authService.logout(req.body);
    res.status(200).json({
      is_success: true, 
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      is_success: false,
      error: error.message || "Lỗi server trong quá trình đăng xuất",
    });
  }
};

export { register, login, logout };
