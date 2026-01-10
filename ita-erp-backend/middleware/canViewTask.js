const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const taskId =
      req.params.id ||
      req.params.taskId ||
      req.params.parentTaskId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Admin / Manager → always view
    if (role === "admin" || role === "manager") {
      return next();
    }

    // Employee → assigned directly
    if (task.assignedTo?.toString() === userId) {
      return next();
    }

    // Employee → subtask of assigned parent
    if (task.parentTask) {
      const parent = await Task.findById(task.parentTask);
      if (parent?.assignedTo?.toString() === userId) {
        return next();
      }
    }

    return res.status(403).json({ message: "View access denied" });
  } catch (err) {
    console.error("canViewTask error:", err);
    res.status(500).json({ message: "Permission check failed" });
  }
};
