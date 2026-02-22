const router = require("express").Router();
const staffReportCtrl = require("../controllers/staffReportController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.use(auth);

/**
 * POST /api/staff-reports/submit
 * कर्मचारी विशिष्ट वेळेसाठी रिपोर्ट सबमिट करण्यासाठी
 */
router.post("/submit", staffReportCtrl.submitManualReport);

/**
 * GET /api/staff-reports/all
 * केवळ Admin आणि Manager सर्व स्टाफचे रिपोर्ट पाहू शकतात
 */
router.get("/all", role("admin", "manager"), staffReportCtrl.getAllStaffReports);

/**
 * GET /api/staff-reports/by-date
 * तारखेनुसार रिपोर्ट फिल्टर करणे
 */
router.get("/by-date", role("admin", "manager"), staffReportCtrl.getReportsByDate);

/**
 * GET /api/staff-reports/check-slot
 * विशिष्ट वेळेसाठी रिपोर्ट सबमिट केला आहे का तपासणे
 */
router.get("/check-slot", staffReportCtrl.checkSlotSubmission);

module.exports = router;