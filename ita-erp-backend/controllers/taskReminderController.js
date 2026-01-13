const Task = require("../models/Task");
const mongoose = require("mongoose");

exports.getPendingTaskReminder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    console.log("USER:", req.user.id);
console.log("NOW:", now);


    const baseQuery = {
      assignedTo: userId,
      status: { $in: ["todo", "in-progress", "review"] },
      dueDate: { $exists: true, $ne: null }
    };

    const pendingTasks = await Task.countDocuments({
      ...baseQuery,
      dueDate: { $gte: now }
    });

    const overdueTasks = await Task.countDocuments({
      ...baseQuery,
      dueDate: { $lt: now }
    });

    res.json({
      pending: pendingTasks,
      overdue: overdueTasks,
      total: pendingTasks + overdueTasks
    });
  } catch (err) {
    console.error("🔥 Reminder Error:", err.message);
    res.status(500).json({ message: "Failed to fetch task reminder" });
  }
};
