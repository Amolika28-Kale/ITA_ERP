const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/dashboardController");

router.use(auth); // ✅ APPLY AUTH TO ALL

// ⚠️ SPECIFIC ROUTE FIRST
router.get("/employee", role("employee"), ctrl.employeeDashboard);

// GENERAL ADMIN ROUTE AFTER
router.get("/", role("admin"), ctrl.getAdminStats);

module.exports = router;
