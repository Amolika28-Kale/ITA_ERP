const ActivityLog = require("../models/ActivityLog");

/* ================= PROJECT ACTIVITY ================= */
exports.getActivityByProject = async (req, res) => {
  try {
    const query = {
      project: req.params.projectId,
    };

    // 🔒 Employee → only their own activity
    if (req.user.role === "employee") {
      query.performedBy = req.user.id;
    }

    const logs = await ActivityLog.find(query)
      .populate("performedBy", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

/* ================= TASK ACTIVITY ================= */
exports.getActivityByTask = async (req, res) => {
  try {
    const query = {
      entityType: "task",
      entityId: req.params.taskId,
    };

    const logs = await ActivityLog.find(query)
      .populate("performedBy", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task activity" });
  }
};
