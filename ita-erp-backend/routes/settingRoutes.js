// routes/settingRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/settingController");

router.use(auth);

// Profile routes
router.get("/me", ctrl.getMyProfile);
router.put("/me", ctrl.updateProfile);
router.put("/change-password", ctrl.changePassword);

// Admin only routes
router.get("/admin/staff", role("admin"), ctrl.getAllStaff);
router.get("/admin/staff/:id", role("admin"), ctrl.getStaffById);

module.exports = router;