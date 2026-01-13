const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/adminAttendanceController");

// 🔐 Admin only
router.use(auth);
router.use(role("admin"));

// 📅 Daily attendance
// /api/admin/attendance?date=2026-01-13
router.get("/attendance", ctrl.getDailyAttendance);

module.exports = router;
