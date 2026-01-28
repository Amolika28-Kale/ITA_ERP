const ActivityLog = require("../models/ActivityLog");

exports.logActivity = async ({
  entityType,
  entityId,
  action,
  message,
  userId,
  projectId,
  visibleTo = []
}) => {
  try {
    await ActivityLog.create({
      entityType,
      entityId,
      action,
      message,
      performedBy: userId,
      project: projectId || null, // ✅ जर projectId नसेल तर null पाठवा
      visibleTo
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};