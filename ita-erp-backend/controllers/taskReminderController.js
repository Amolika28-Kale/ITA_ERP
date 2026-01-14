const Task = require("../models/Task");
const mongoose = require("mongoose");

exports.getPendingTaskReminder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 🧠 Normalize TODAY (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseQuery = {
      assignedTo: userId,
      status: { $in: ["todo", "in-progress", "review"] },
      dueDate: { $exists: true, $ne: null }
    };

    // 🔴 Overdue = before today
    const overdueTasks = await Task.find({
      ...baseQuery,
      dueDate: { $lt: today }
    }).select("_id title status dueDate");

    // 🟡 Pending = today or future
    const pendingTasks = await Task.find({
      ...baseQuery,
      dueDate: { $gte: today }
    }).select("_id title status dueDate");

    res.json({
      pendingCount: pendingTasks.length,
      overdueCount: overdueTasks.length,
      pendingTasks,
      overdueTasks
    });
  } catch (err) {
    console.error("🔥 Reminder Error:", err);
    res.status(500).json({ message: "Failed to fetch task reminder" });
  }
};

