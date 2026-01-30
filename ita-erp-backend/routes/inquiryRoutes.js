// routes/inquiryRoutes.js मध्ये हे अपडेट करा
const router = require("express").Router();
const ctrl = require("../controllers/inquiryController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

// चूक: router.post("/", ctrl.createRequest); 
// बरोबर:
router.post("/", ctrl.createInquiry); // इथे नाव कंट्रोलरशी मॅच व्हायला हवे
router.get("/", ctrl.getInquiries);
router.patch("/:id", ctrl.updateInquiry);

module.exports = router;