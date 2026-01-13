const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/messageController");

router.use(auth);

// Admin
router.post("/", role("admin"), ctrl.sendMessage);
router.get("/sent", role("admin"), ctrl.getSentMessages);

// Employee
router.get("/inbox", ctrl.getInbox);

// Shared
router.get("/:id", ctrl.getMessageById);

module.exports = router;
