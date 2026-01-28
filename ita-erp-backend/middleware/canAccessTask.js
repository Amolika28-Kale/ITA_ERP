const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const taskId = req.params.id || req.params.taskId || req.params.parentTaskId;

    if (!taskId) return next();

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 1. Admin & Manager → पूर्ण ॲक्सेस
    if (role === "admin" || role === "manager") return next();

    // 2. ✅ DIRECT TASK ACCESS (Array Check)
    // assignedTo आता Array असल्याने .some() वापरणे गरजेचे आहे
    const isAssigned = Array.isArray(task.assignedTo)
      ? task.assignedTo.some(id => id.toString() === userId)
      : task.assignedTo?.toString() === userId;

    const isCreator = task.createdBy?.toString() === userId;

    if (isAssigned || isCreator) return next();

    // 3. ✅ SUBTASK / PARENT ACCESS
    // जर युजर पॅरेंट टास्कला असाइन असेल, तर त्याला सबटास्कचा ॲक्सेस मिळायला हवा
    if (task.parentTask) {
      const parentTask = await Task.findById(task.parentTask);
      if (parentTask) {
        const isParentAssigned = Array.isArray(parentTask.assignedTo)
          ? parentTask.assignedTo.some(id => id.toString() === userId)
          : parentTask.assignedTo?.toString() === userId;

        if (isParentAssigned) return next();
      }
    }

    // 4. जर वरीलपैकी काहीही नसेल तर ॲक्सेस नाकारा
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error("Task access error", err);
    res.status(500).json({ message: "Permission check failed" });
  }
};