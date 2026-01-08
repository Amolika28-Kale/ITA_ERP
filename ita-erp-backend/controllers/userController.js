const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, teamId } = req.body;

    const hashedPassword = await bcrypt.hash("user123", 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      teamId,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= GET USERS ================= */
exports.getUsers = async (req, res) => {
  const users = await User.find().populate("teamId", "name");
  res.json(users);
};

/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(user);
};

/* ================= TOGGLE USER STATUS ================= */
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isActive = !user.isActive;
  await user.save();
  res.json(user);
};

