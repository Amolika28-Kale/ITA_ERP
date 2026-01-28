const Attendance = require("../models/Attendance");
const DailyAchievement = require("../models/DailyAchievement");
const User = require("../models/User");

exports.getDailyAttendance = async (req, res) => {
  try {
    const date =
      req.query.date ||
      new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

    const users = await User.find({ isActive: true }).select(
      "name email role"
    );

    const attendance = await Attendance.find({ date }).populate(
      "user",
      "name email role"
    );
const achievements = await DailyAchievement.find({ date });

const achievementMap = {};
achievements.forEach(a => {
  achievementMap[a.user.toString()] = a.achievement;
});

    const attendanceMap = {};

    attendance.forEach(a => {
      if (a.user && a.user._id) {
        attendanceMap[a.user._id.toString()] = a;
      }
    });

    const result = users.map(user => {
      const record = attendanceMap[user._id.toString()];

      if (!record) {
        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: "absent",
          loginTime: null,
          logoutTime: null,
          workedMinutes: 0,
        };
      }

return {
  userId: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: record.status,
  loginTime: record.loginTime,
  logoutTime: record.logoutTime,
  workedMinutes: record.totalMinutes || 0,
  achievement: achievementMap[user._id.toString()] || null
};

    });

    res.json({
      date,
      totalUsers: users.length,
      present: attendance.filter(a => a.user).length,
      data: result,
    });
  } catch (err) {
    console.error("Admin Attendance Error:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};
