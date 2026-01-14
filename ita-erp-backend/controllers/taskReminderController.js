const Task = require("../models/Task");
const mongoose = require("mongoose");

exports.getPendingTaskReminder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const baseQuery = {
      assignedTo: userId,
      status: { $in: ["todo", "in-progress", "review"] },
      dueDate: { $exists: true, $ne: null }
    };

    // ✅ Pending (future / today)
    const pendingTasks = await Task.find({
      ...baseQuery,
      dueDate: { $gte: now }
    })
      .select("title dueDate status")
      .sort({ dueDate: 1 })
      .limit(10);

    // ✅ Overdue
    const overdueTasks = await Task.find({
      ...baseQuery,
      dueDate: { $lt: now }
    })
      .select("title dueDate status")
      .sort({ dueDate: 1 })
      .limit(10);

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
