const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/teamController");

router.use(auth, role("admin"));

router.post("/", ctrl.createTeam);
router.get("/", ctrl.getTeams);
router.put("/:id", ctrl.updateTeam);

module.exports = router;
