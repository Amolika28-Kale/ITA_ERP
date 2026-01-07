const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/projectController");

router.use(auth, role("admin", "manager"));

router.post("/", ctrl.createProject);
router.get("/", ctrl.getProjects);
router.put("/:id", ctrl.updateProject);

module.exports = router;
