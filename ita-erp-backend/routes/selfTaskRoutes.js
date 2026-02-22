const router = require("express").Router();
const ctrl = require("../controllers/selfTaskController");
const auth = require("../middleware/authMiddleware");

router.use(auth);

router.get("/status", ctrl.checkTodayStatus);
router.get("/today-plan", ctrl.getTodayPlan); // Add this new route
router.post("/plan", ctrl.submitMorningPlan);
router.post("/achievement", ctrl.submitEveningAchievement);

module.exports = router;