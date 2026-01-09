const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, teamId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const password = await bcrypt.hash("user123", 10);

    const user = await User.create({
      name,
      email,
      password,
      role,
      teamId,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET USERS ================= */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select("name email role");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
  try {
    // Prevent role escalation
    if (req.body.role && req.user.role !== "admin") {
      return res.status(403).json({ message: "Cannot change role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= TOGGLE USER STATUS ================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Cannot disable yourself" });
    }

    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ASSIGN USER TO TEAM ================= */
exports.assignUserToTeam = async (req, res) => {
  try {
    const { teamId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { teamId },
      { new: true }
    ).populate("teamId", "name");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
