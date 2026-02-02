const router = require("express").Router();
const reportCtrl = require("../controllers/reportController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Apply authentication and restrict to Admin/Manager
router.use(auth);
router.use(role("admin", "manager"));

/**
 * GET /api/reports/interval
 * Used for the 3-hour slot selection
 */
router.get("/interval", reportCtrl.getThreeHourReport);

module.exports = router;