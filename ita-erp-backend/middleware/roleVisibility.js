const Task = require("../models/Task");

module.exports = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { projectId } = req.params;

    // Admin & Manager → full access
    if (role === "admin" || role === "manager") {
      req.taskFilter = { project: projectId };
      return next();
    }

    // Employee → only assigned or created tasks
    req.taskFilter = {
      project: projectId,
      $or: [
        { assignedTo: userId },
        { createdBy: userId },
      ],
    };

    next();
  } catch (err) {
    console.error("Task visibility error", err);
    res.status(500).json({ message: "Access check failed" });
  }
};
