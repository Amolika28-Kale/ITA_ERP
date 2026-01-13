const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const ctrl = require("../controllers/taskReminderController");

router.use(auth);

// /api/tasks/reminder
router.get("/tasks/reminder", ctrl.getPendingTaskReminder);

module.exports = router;
