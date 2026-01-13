const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const taskId =
      req.params.id ||
      req.params.taskId ||
      req.params.parentTaskId;

    // 🔥 VERY IMPORTANT FIX
    if (!taskId) {
      return next();
    }

    const { role, id: userId } = req.user;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (role === "admin" || role === "manager") {
      return next();
    }

    if (task.assignedTo?.toString() === userId) {
      return next();
    }

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
