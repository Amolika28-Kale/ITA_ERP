const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= GET LOGGED-IN USER ================= */
exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("teamId", "name");

  res.json(user);
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name },
    { new: true }
  ).select("-password");

  res.json(user);
};

/* ================= CHANGE PASSWORD ================= */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findById(req.user.id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully" });
};
