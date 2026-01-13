const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const taskId =
      req.params.id ||
      req.params.taskId ||
      req.params.parentTaskId;

      if (!taskId) {
  return next();
}

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Admin & Manager → full access
    if (role === "admin" || role === "manager") {
      return next();
    }

    // ✅ DIRECT TASK ACCESS
    if (
      task.assignedTo?.toString() === userId ||
      task.createdBy?.toString() === userId
    ) {
      return next();
    }

    // ✅ SUBTASK ACCESS (NEW FIX)
    if (task.parentTask) {
      const parentTask = await Task.findById(task.parentTask);

      if (
        parentTask &&
        parentTask.assignedTo?.toString() === userId
      ) {
        return next();
      }
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("Task access error", err);
    res.status(500).json({ message: "Permission check failed" });
  }
};
