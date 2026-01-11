const ActivityLog = require("../models/ActivityLog");

/* ================= ADMIN / USER RECENT ACTIVITY ================= */
exports.getRecentActivity = async (req, res) => {
  try {
    let filter = {};

    // 👑 ADMIN → ALL ACTIVITY
    if (req.user.role !== "admin") {
      filter.visibleTo = req.user.id;
    }

    const logs = await ActivityLog.find(filter)
      .populate("performedBy", "name role")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

/* ================= PROJECT ACTIVITY ================= */
exports.getActivityByProject = async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      project: req.params.projectId,
    })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
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
