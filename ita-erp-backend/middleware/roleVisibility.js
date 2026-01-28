const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { projectId } = req.params;

    if (role === "admin" || role === "manager") {
      req.taskFilter = { project: projectId };
      return next();
    }

    // ✅ MongoDB $in वापरून Array मध्ये युजरचा ID शोधा
    req.taskFilter = {
      project: projectId,
      $or: [
        { assignedTo: { $in: [userId] } }, 
        { createdBy: userId },
      ],
    };

    next();
  } catch (err) {
    console.error("Task visibility error", err);
    res.status(500).json({ message: "Access check failed" });
  }
};