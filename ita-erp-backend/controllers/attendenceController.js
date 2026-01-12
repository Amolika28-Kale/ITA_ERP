const Attendance = require("../models/Attendence");
const { sendNotification } = require("../utils/notify");

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

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
    attendance.totalMinutes += totalMinutes;

    // Half day logic (optional)
    if (attendance.totalMinutes < 240) {
      attendance.status = "half-day";
    }

    await attendance.save();
    await sendNotification({
  users: [req.user.id],
  title: "Attendance Closed",
  message: "You have logged out",
  type: "attendance"
});

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
  await sendNotification({
  users: [req.user.id],
  title: "Attendance Closed",
  message: "You have logged out",
  type: "attendance"
});
};
