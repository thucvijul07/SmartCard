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

// Xóa mềm user
export const deleteUserById = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { deleted_at: new Date() });
  } catch (err) {
    throw new Error(err.message);
  }
};

// Cập nhật thông tin user
export const updateUserInfo = async (userId, updateData) => {
  try {
    const allowedFields = ["username", "email", "birthday"];
    const update = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) update[key] = updateData[key];
    }
    const user = await User.findOneAndUpdate(
      { _id: userId, deleted_at: null },
      update,
      { new: true }
    ).select("-password_hash -deleted_at");
    if (!user) throw new Error("Người dùng không tồn tại");
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
};

// Đổi mật khẩu user
export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findOne({ _id: userId, deleted_at: null });
    if (!user) throw new Error("Người dùng không tồn tại");
    // Giả sử User có method comparePassword
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Mật khẩu cũ không đúng");
    user.password_hash = await user.constructor.hashPassword(newPassword);
    await user.save();
    return true;
  } catch (err) {
    throw new Error(err.message);
  }
};
