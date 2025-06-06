import User from "../models/User.js";

export const getUserInfo = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId, deleted_at: null }).select(
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

// Cập nhật thông tin user
export const updateUserInfo = async (userId, updateData) => {
  try {
    // Chỉ cho phép cập nhật một số trường nhất định
    const allowedFields = ["username", "email", "birthday", "avatar_url"];
    const update = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) update[key] = updateData[key];
    }
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password_hash -deleted_at");
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Xóa mềm user
export const deleteUserById = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { deleted_at: new Date() });
  } catch (err) {
    throw new Error(err.message);
  }
};
