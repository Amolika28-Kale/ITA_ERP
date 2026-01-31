// const router = require("express").Router();
// const auth = require("../middleware/authMiddleware");
// const role = require("../middleware/roleMiddleware");
// const ctrl = require("../controllers/taskController");
// const taskVisibility = require("../middleware/roleVisibility");
// const canAccessTask = require("../middleware/canAccessTask");
// const canViewTask = require("../middleware/canViewTask");
// const reminderCtrl = require("../controllers/taskReminderController");

// router.use(auth);
// /* ================= REMINDER (MUST BE FIRST) ================= */

// router.get("/reminder", reminderCtrl.getPendingTaskReminder);
// /* ================= TASK CRUD ================= */

// router.post("/", role("admin", "manager"), ctrl.createTask);

// router.get("/all", role("admin"), ctrl.getTasksByProject);

// router.get("/my", ctrl.getMyTasks);

// /* ======= READ (VIEW) ======= */

// router.get("/:id", canViewTask, ctrl.getTaskDetails);

// router.get("/:taskId/activity", canViewTask, ctrl.getTaskActivity);

// router.get("/:taskId/comments", canViewTask, ctrl.getComments);

// router.get("/:parentTaskId/subtasks", canViewTask, ctrl.getSubTasks);


// 
// /* ======= WRITE (MODIFY) ======= */

// router.put("/:id", role("admin", "manager"), ctrl.updateTask);

// router.delete("/:id", role("admin", "manager"), ctrl.deleteTask);

// router.patch("/:id/status", canAccessTask, ctrl.updateTaskStatus);

// router.post("/:taskId/comments", canAccessTask, ctrl.addComment);

// router.put("/comments/:commentId", auth, ctrl.updateComment);

// router.post(
//   "/:parentTaskId/subtasks",
//   role("admin", "manager"),
//   ctrl.createSubTask
// );

// module.exports = router;

const router = require("express").Router();
const ctrl = require("../controllers/taskController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const reminderCtrl = require("../controllers/taskReminderController");
const canAccessTask = require("../middleware/canAccessTask");


router.use(auth);
router.get("/reminder", reminderCtrl.getPendingTaskReminder);

// Admin/Manager Actions
router.post("/", role("admin", "manager"), ctrl.createTask);
// Employee self task
router.post("/self", role("employee"), ctrl.createSelfTask);

router.get("/all", role("admin", "manager"), ctrl.getAllTasks);
// Shared Actions
router.get("/my", ctrl.getMyTasks);
router.get("/daily/today", auth, ctrl.getTodayTasks);

router.patch("/:id/done-today", auth, ctrl.markTaskDoneToday);
router.patch("/:id/status", canAccessTask, ctrl.updateTaskStatus);

router.get("/tasks/daily/admin", auth, ctrl.getAdminDailyTasks);
router.get("/:id", ctrl.getTaskDetails);
router.patch("/:id/toggle", ctrl.toggleTaskStatus); // The checkbox endpoint

module.exports = router;