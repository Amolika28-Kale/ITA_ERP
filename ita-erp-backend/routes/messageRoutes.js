const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/messageController");

// ADMIN
router.post("/", auth, role("admin"), ctrl.sendMessage);

// EMPLOYEE
router.get("/my", auth, ctrl.getMyMessages);

module.exports = router;
