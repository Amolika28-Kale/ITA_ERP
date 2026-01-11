const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

router.get("/", auth, getMyNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.put("/:id/read", auth, markAsRead);
router.put("/mark-all-read", auth, markAllAsRead);

module.exports = router;
