const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/taskController");
const taskVisibility = require("../middleware/roleVisibility");
const canAccessTask = require("../middleware/canAccessTask");
const canViewTask = require("../middleware/canViewTask");

router.use(auth);

/* ================= TASK CRUD ================= */

router.post("/", role("admin", "manager"), ctrl.createTask);

router.get("/project/:projectId", taskVisibility, ctrl.getTasksByProject);

router.get("/my", ctrl.getMyTasks);

/* ======= READ (VIEW) ======= */

router.get("/:id", canViewTask, ctrl.getTaskDetails);

router.get("/:taskId/activity", canViewTask, ctrl.getTaskActivity);

router.get("/:taskId/comments", canViewTask, ctrl.getComments);

router.get("/:parentTaskId/subtasks", canViewTask, ctrl.getSubTasks);

/* ======= WRITE (MODIFY) ======= */

router.put("/:id", role("admin", "manager"), ctrl.updateTask);

router.delete("/:id", role("admin", "manager"), ctrl.deleteTask);

router.patch("/:id/status", canAccessTask, ctrl.updateTaskStatus);

router.post("/:taskId/comments", canAccessTask, ctrl.addComment);

router.put("/comments/:commentId", auth, ctrl.updateComment);

router.post(
  "/:parentTaskId/subtasks",
  role("admin", "manager"),
  ctrl.createSubTask
);

module.exports = router;
