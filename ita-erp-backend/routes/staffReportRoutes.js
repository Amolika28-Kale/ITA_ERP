const router = require("express").Router();
const staffReportCtrl = require("../controllers/staffReportController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// सर्व रूट्ससाठी ऑथेंटिकेशन अनिवार्य आहे
router.use(auth);

/**
 * POST /api/staff-reports/submit
 * कर्मचारी स्वतःचा ३ तासांचा रिपोर्ट मॅन्युअली सबमिट करण्यासाठी
 */
router.post("/submit", staffReportCtrl.submitManualReport);

/**
 * GET /api/staff-reports/all
 * केवळ Admin आणि Manager सर्व स्टाफचे मॅन्युअल रिपोर्ट पाहू शकतात
 */
router.get("/all", role("admin", "manager"), staffReportCtrl.getAllStaffReports);

module.exports = router;