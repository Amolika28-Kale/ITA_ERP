const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/notificationController");

router.get("/", auth, ctrl.getMyNotifications);
router.put("/:id/read", auth, ctrl.markAsRead);
router.put("/read-all", auth, ctrl.markAllAsRead);
router.get("/unread-count", auth, ctrl.getUnreadCount);


module.exports = router;
