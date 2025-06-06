import { getUserInfo, updateUserInfo, deleteUserById } from "../services/userService.js";

export const getUser = async (req, res) => {
  try {
    const user = await getUserInfo(req.user._id);
    // Trả về thêm trường created_at
    return res.status(200).json({
      is_success: true,
      data: {
        ...user.toObject(),
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      message: err.message,
    });
  }
};

// API cập nhật thông tin user
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateUserInfo(req.user._id, req.body);
    return res.status(200).json({
      is_success: true,
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      message: err.message,
    });
  }
};

// API xóa user
export const deleteUser = async (req, res) => {
  try {
    await deleteUserById(req.user._id);
    return res.status(200).json({
      is_success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      message: err.message,
    });
  }
};
