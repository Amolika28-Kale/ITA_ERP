const Attendance = require("../models/Attendance");
const { getTodayIST } = require("./getToday");

exports.markLoginAttendance = async (userId) => {
  const today = getTodayIST();

  const existing = await Attendance.findOne({
    user: userId,
    date: today,
    logoutTime: null
  });

  if (!existing) {
    await Attendance.create({
      user: userId,
      date: today,
      loginTime: new Date(),
      status: "present"
    });
  }
};
