const router = require("express").Router();
const { submitAchievement } = require("../controllers/achievementController");
const { logout } = require("../controllers/attendenceController");
const auth = require("../middleware/authMiddleware");

router.use(auth);
router.post("/achievement", submitAchievement);
router.post("/logout", logout);

module.exports = router;
