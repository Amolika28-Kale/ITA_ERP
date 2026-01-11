const ActivityLog = require("../models/ActivityLog");

/* ================= PROJECT ACTIVITY (ADMIN SEES ALL) ================= */
exports.getActivityByProject = async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      project: req.params.projectId,
    })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

/* ================= TASK ACTIVITY ================= */
exports.getActivityByTask = async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      entityType: "task",
      entityId: req.params.taskId,
    })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task activity" });
  }
};
