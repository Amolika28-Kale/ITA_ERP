const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/taskController");

router.use(auth);

/* TASK CRUD */
router.post("/", role("admin", "manager"), ctrl.createTask);
router.get("/project/:projectId", ctrl.getTasksByProject);
router.put("/:id", role("admin", "manager"), ctrl.updateTask);
router.delete("/:id", role("admin", "manager"), ctrl.deleteTask);

/* KANBAN */
router.patch("/:id/status", ctrl.updateTaskStatus);

/* COMMENTS */
router.post("/:taskId/comments", ctrl.addComment);
router.get("/:taskId/comments", ctrl.getComments);

/* ================= SUBTASKS ================= */

// Create subtask
router.post(
  "/:parentTaskId/subtasks",
  role("admin", "manager"),
  ctrl.createSubTask
);

// Get subtasks
router.get(
  "/:parentTaskId/subtasks",
  ctrl.getSubTasks
);

module.exports = router;
