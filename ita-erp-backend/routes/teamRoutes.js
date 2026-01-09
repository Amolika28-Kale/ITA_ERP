const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/teamController");

router.use(auth);

router.post("/", role("admin", "manager"), ctrl.createTeam);
router.get("/", ctrl.getTeams);
router.put("/:id", role("admin", "manager"), ctrl.updateTeam);
router.patch("/:id/disable", role("admin"), ctrl.disableTeam);

module.exports = router;
