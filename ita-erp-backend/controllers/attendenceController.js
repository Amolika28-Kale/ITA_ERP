const { getTodayIST } = require("../utils/getToday");
const Attendance = require("../models/Attendance");
const DailyAchievement = require("../models/DailyAchievement");
const { sendNotification } = require("../utils/notify");

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIXED
    const today = getTodayIST();

    // 1️⃣ Achievement check
    const achievement = await DailyAchievement.findOne({
      user: userId,
      date: today
    });

    if (!achievement) {
      return res.status(403).json({
        code: "ACHIEVEMENT_REQUIRED",
        message: "Submit today's achievement before logout"
      });
    }

    // 2️⃣ Find ACTIVE attendance
    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
      logoutTime: null
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No active session found"
      });
    }

    // 3️⃣ Logout update
    const logoutTime = new Date();
    const totalMinutes = Math.floor(
      (logoutTime - attendance.loginTime) / 60000
    );

    attendance.logoutTime = logoutTime;
    attendance.totalMinutes = totalMinutes;
    attendance.status = totalMinutes < 240 ? "half-day" : "present";

    await attendance.save();

    res.json({
      message: "Logged out successfully",
      workedMinutes: totalMinutes
    });

  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};



