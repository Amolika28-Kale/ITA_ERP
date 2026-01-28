const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId || req.params.parentTaskId;

    if (!taskId) return next();

    const { role, id: userId } = req.user;
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Admin & Manager ला पूर्ण ॲक्सेस
    if (role === "admin" || role === "manager") return next();

    // ✅ ARRAY CHECK: assignedTo मध्ये युजर आहे का तपासा
    const isAssigned = Array.isArray(task.assignedTo) 
      ? task.assignedTo.some(id => id.toString() === userId)
      : task.assignedTo?.toString() === userId;

    if (isAssigned || task.createdBy?.toString() === userId) {
      return next();
    }

    // ✅ PARENT TASK ARRAY CHECK
    if (task.parentTask) {
      const parent = await Task.findById(task.parentTask);
      const isParentAssigned = Array.isArray(parent?.assignedTo)
        ? parent.assignedTo.some(id => id.toString() === userId)
        : parent?.assignedTo?.toString() === userId;

      if (isParentAssigned) return next();
    }

    return res.status(403).json({ message: "View access denied" });
  } catch (err) {
    console.error("canViewTask error:", err);
    res.status(500).json({ message: "Permission check failed" });
  }
};