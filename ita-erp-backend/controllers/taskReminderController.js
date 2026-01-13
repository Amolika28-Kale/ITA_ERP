const Task = require("../models/Task");

exports.getPendingTaskReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ["todo", "in-progress", "review"] },
      dueDate: { $gte: now }
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $in: ["todo", "in-progress", "review"] },
      dueDate: { $lt: now }
    });

    res.json({
      pending: pendingTasks,
      overdue: overdueTasks,
      total: pendingTasks + overdueTasks
    });
  } catch (err) {
    console.error("Reminder Error:", err);
    res.status(500).json({ message: "Failed to fetch task reminder" });
  }
};
