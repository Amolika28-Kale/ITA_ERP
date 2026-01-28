const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");

/* ================= ADMIN / USER RECENT ACTIVITY ================= */
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};

    // 👑 ADMIN → SEE EVERYTHING
    if (role !== "admin") {
      filter = {
        $or: [
          { performedBy: userId },
          // ✅ FIX: Use $in to check if userId is inside the visibleTo array
          { visibleTo: { $in: [userId] } }
        ]
      };
    }

    const logs = await ActivityLog.find(filter)
      .populate("performedBy", "name role")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    console.error("Recent activity error:", err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

/* ================= PROJECT ACTIVITY ================= */
exports.getActivityByProject = async (req, res) => {
  try {
    // युजरला फक्त त्याच्याशी संबंधित प्रोजेक्टची ऍक्टिव्हिटी दिसावी यासाठी फिल्टर
    const filter = { project: req.params.projectId };
    
    if (req.user.role !== "admin") {
      filter.visibleTo = { $in: [req.user.id] };
    }

    const logs = await ActivityLog.find(filter)
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
    // ✅ FIX: Ensure mongoose is imported or use string ID directly if Mongoose handles it
    const logs = await ActivityLog.find({
      entityType: { $in: ["task", "subtask", "comment"] }, // टास्कशी संबंधित सर्व प्रकार
      entityId: req.params.taskId,
    })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    console.error("Task Activity Error:", err);
    res.status(500).json({ message: "Failed to load task activity" });
  }
};