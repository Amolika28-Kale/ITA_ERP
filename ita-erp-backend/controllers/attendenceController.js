const { getTodayIST } = require("../utils/getToday");
const Attendance = require("../models/Attendance");
const { sendNotification } = require("../utils/notify");
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayIST();

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
      logoutTime: null
    });

    if (!attendance) {
      return res.status(400).json({ message: "No active login found" });
    }

    const logoutTime = new Date();
    const diffMs = logoutTime - attendance.loginTime;
    const totalMinutes = Math.floor(diffMs / 60000);

    attendance.logoutTime = logoutTime;
    attendance.totalMinutes = totalMinutes;

    if (totalMinutes < 240) {
      attendance.status = "half-day";
    }

    await attendance.save();
    console.log("LOGOUT USER:", req.user);


    await sendNotification({
      users: [userId],
      title: "Attendance Closed",
      message: "You have logged out",
      type: "attendance"
    });

    res.json({
      message: "Logged out successfully",
      workedMinutes: totalMinutes
    });

  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};
