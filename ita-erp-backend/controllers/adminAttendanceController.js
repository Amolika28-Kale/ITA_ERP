const Attendance = require("../models/Attendence");
const User = require("../models/User");

/* ================= ADMIN DAILY ATTENDANCE ================= */
exports.getDailyAttendance = async (req, res) => {
  try {
    // IST date (default today)
    const date =
      req.query.date ||
      new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
      });

    // All active users
    const users = await User.find({ isActive: true }).select(
      "name email role"
    );

    // Attendance of that day
    const attendance = await Attendance.find({ date }).populate(
      "user",
      "name email role"
    );

    const attendanceMap = {};
    attendance.forEach(a => {
      attendanceMap[a.user._id.toString()] = a;
    });

    // Merge users + attendance
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
          workedMinutes: 0
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
        workedMinutes: record.totalMinutes
      };
    });

    res.json({
      date,
      totalUsers: users.length,
      present: attendance.length,
      data: result
    });
  } catch (err) {
    console.error("Admin Attendance Error:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};
