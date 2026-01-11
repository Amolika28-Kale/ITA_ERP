const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/activityController");

router.use(auth);

// Project timeline
router.get("/project/:projectId", ctrl.getActivityByProject);

// Task timeline
router.get("/task/:taskId", ctrl.getActivityByTask);

module.exports = router;
