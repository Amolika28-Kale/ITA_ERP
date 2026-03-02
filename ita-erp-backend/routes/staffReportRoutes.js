const express = require("express");
const router = express.Router();
const staffReportCtrl = require("../controllers/staffReportController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth);

// ✅ POST - Submit report
router.post("/submit", staffReportCtrl.submitManualReport);

// ✅ GET - Get my reports (with filters)
router.get("/my-reports", staffReportCtrl.getMyReports);  // This should now work

// ✅ GET - Get all reports (admin only)
router.get("/all", role("admin", "manager"), staffReportCtrl.getAllStaffReports);

// ✅ GET - Get reports by date (admin only)
router.get("/by-date", role("admin", "manager"), staffReportCtrl.getReportsByDate);

// ✅ GET - Check slot submission
router.get("/check-slot", staffReportCtrl.checkSlotSubmission);

// Log all routes
console.log("✅ Staff Report Routes Registered:");
router.stack.forEach(layer => {
  if (layer.route) {
    console.log(`   ${Object.keys(layer.route.methods).join(', ').toUpperCase()} /api/staff-reports${layer.route.path}`);
  }
});

module.exports = router;