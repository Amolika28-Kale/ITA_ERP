const { getTodayIST } = require("../utils/getToday");
const Attendance = require("../models/Attendance");
const SelfTask = require("../models/SelfTask"); // ✅ DailyAchievement ऐवजी SelfTask वापरा
const { sendNotification } = require("../utils/notify");

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming role is in your JWT
    const today = getTodayIST();
// ✅ Skip achievement check if user is NOT an employee
    if (userRole === "employee") {
      const taskRecord = await SelfTask.findOne({ user: userId, date: today });
      if (!taskRecord || !taskRecord.achievements) {
        return res.status(403).json({
          code: "ACHIEVEMENT_REQUIRED",
          message: "Recap required for employees."
        });
      }
    }


    // 2️⃣ Find ACTIVE attendance session
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

    // 3️⃣ Logout calculation and update
    const logoutTime = new Date();
    const totalMinutes = Math.floor(
      (logoutTime - attendance.loginTime) / 60000
    );

    attendance.logoutTime = logoutTime;
    attendance.totalMinutes = totalMinutes;
    
    // कामाच्या तासानुसार स्टेटस सेट करा (उदा. ४ तासांपेक्षा कमी = half-day)
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