import User from "../models/User.js";
export const getUserInfo = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "-password_hash -deleted_at"
    );

    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};
