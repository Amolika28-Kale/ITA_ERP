const ActivityLog = require("../models/ActivityLog");

/* ================= GET ACTIVITY BY PROJECT ================= */
exports.getActivityByProject = async (req, res) => {
  try {
    const query = { project: req.params.projectId };

    if (req.user.role === "employee") {
      query.performedBy = req.user.id;
    }

    const logs = await Activity.find(query)
      .populate("performedBy", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

exports.getActivityByTask = async (req, res) => {
  try {
    const logs = await ActivityLog.find({
      entityType: "task",
      entityId: req.params.taskId,
    })
      .populate("performedBy", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task activity" });
  }
};
