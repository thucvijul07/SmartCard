import { getUserInfo } from "../services/userService.js";

export const getUser = async (req, res) => {
  try {
    const user = await getUserInfo(req.user._id);

    return res.status(200).json({
      is_success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      message: err.message,
    });
  }
};
