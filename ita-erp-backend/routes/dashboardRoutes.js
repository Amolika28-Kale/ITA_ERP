const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/dashboardController");

router.get("/", auth, role("admin"), ctrl.getAdminStats);

router.get("/employee", role("employee"), ctrl.employeeDashboard);

module.exports = router;
