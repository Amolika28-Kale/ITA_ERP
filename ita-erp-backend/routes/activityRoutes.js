const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/activityController");

router.use(auth);

// Project activity timeline
router.get("/project/:projectId", ctrl.getActivityByProject);
router.get("/task/:taskId", ctrl.getActivityByTask);


module.exports = router;
