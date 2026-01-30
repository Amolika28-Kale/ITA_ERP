const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/dashboardController");

router.use(auth);

/* EMPLOYEE */
router.get("/employee", role("employee"), ctrl.employeeDashboard);
router.get("/employee/pending", role("employee"), ctrl.employeePendingTasks);

// /* ADMIN */
// // ADMIN – Pending employee tasks
router.get("/pending-tasks",role("admin"),ctrl.getAdminPendingTasks);
router.get("/", role("admin"), ctrl.getAdminStats);

module.exports = router;
