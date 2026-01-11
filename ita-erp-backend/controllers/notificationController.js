const Notification = require("../models/Notification");

/* ================= INTERNAL HELPER ================= */
exports.createNotification = async ({
  user,
  title,
  message,
  type,
  entityType,
  entityId
}) => {
  if (!user) return;

  return Notification.create({
    user,
    title,
    message,
    type,
    entityType,
    entityId
  });
};

/* ================= GET MY NOTIFICATIONS ================= */
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

/* ================= UNREAD COUNT ================= */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to load count" });
  }
};

/* ================= MARK ONE AS READ ================= */
exports.markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

/* ================= MARK ALL AS READ ================= */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
};
