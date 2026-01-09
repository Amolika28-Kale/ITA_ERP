const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/projectController");

router.use(auth);

router.post("/", role("admin", "manager"), ctrl.createProject);
router.get("/", ctrl.getProjects);
router.put("/:id", role("admin", "manager"), ctrl.updateProject);
router.patch("/:id/archive", role("admin"), ctrl.archiveProject);
router.patch("/:id/status", role("admin", "manager"), ctrl.updateProjectStatus);

module.exports = router;
