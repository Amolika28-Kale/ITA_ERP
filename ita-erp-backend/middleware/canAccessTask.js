const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const taskId =
      req.params.id ||
      req.params.taskId ||
      req.params.parentTaskId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Admin & Manager → allowed
    if (role === "admin" || role === "manager") {
      return next();
    }

    // Employee → only assigned or creator
    if (
      task.assignedTo?.toString() === userId ||
      task.createdBy?.toString() === userId
    ) {
      return next();
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("Task access error", err);
    res.status(500).json({ message: "Permission check failed" });
  }
};
