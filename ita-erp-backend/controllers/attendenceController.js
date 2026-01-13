const { sendNotification } = require("../utils/notify");
const Attendance = require("../models/Attendence");
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
// During login
await Attendance.updateMany(
  {
    user: user._id,
    logoutTime: null,
    date: { $ne: today }
  },
  {
    logoutTime: new Date(),
    status: "half-day"
  }
);

    const logoutTime = new Date();
    const diffMs = logoutTime - attendance.loginTime;
    const totalMinutes = Math.floor(diffMs / 60000);

    attendance.logoutTime = logoutTime;
    attendance.totalMinutes = totalMinutes;

    if (totalMinutes < 240) {
      attendance.status = "half-day";
    }

    await attendance.save();

    await sendNotification({
      users: [userId],
      title: "Attendance Closed",
      message: "You have logged out",
      type: "attendance"
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};
