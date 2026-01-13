const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendNotification } = require("../utils/notify");
const Attendance = require("../models/Attendence");

/* ================= LOGIN USER ================= */


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // ================= ATTENDANCE LOGIN =================
    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      user: user._id,
      date: today,
      logoutTime: null
    });

    // Only create if no active session today
    if (!existing) {
      await Attendance.create({
        user: user._id,
        date: today,
        loginTime: new Date()
      });
    }

    await sendNotification({
  users: [req.user.id],
  title: "Attendance Marked",
  message: "You have logged in successfully",
  type: "attendance",
  entityType: "attendance",
  entityId: attendance._id
});
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
