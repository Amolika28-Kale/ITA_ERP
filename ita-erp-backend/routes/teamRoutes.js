const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/teamController");

router.use(auth, role("admin", "manager"));

router.post("/", ctrl.createTeam);
router.get("/", ctrl.getTeams);
router.put("/:id", ctrl.updateTeam);
router.patch("/:id/disable", ctrl.disableTeam);

module.exports = router;
