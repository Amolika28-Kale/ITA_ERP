const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/taskController");
const taskVisibility = require("../middleware/roleVisibility");
const canAccessTask = require("../middleware/canAccessTask");
const canViewTask = require("../middleware/canViewTask");
router.use(auth);

/* ================= TASK CRUD ================= */

// Create task
router.post("/", role("admin", "manager"), ctrl.createTask);

// Get tasks by project (ROLE VISIBILITY)
router.get(
  "/project/:projectId",
  taskVisibility,
  ctrl.getTasksByProject
);

/* ================= MY TASKS (EMPLOYEE) ================= */
router.get("/my", ctrl.getMyTasks);

router.get(
  "/:id",
  canViewTask,
  ctrl.getTaskDetails
);
// Update task
router.put(
  "/:id",
  role("admin", "manager"),
  ctrl.updateTask
);

// Delete task
router.delete(
  "/:id",
  role("admin", "manager"),
  ctrl.deleteTask
);

/* ================= KANBAN ================= */

// Update task status
router.patch(
  "/:id/status",
  canAccessTask,
  ctrl.updateTaskStatus
);

/* ================= COMMENTS ================= */

// Add comment
router.post(
  "/:taskId/comments",
  canAccessTask,
  ctrl.addComment
);

// Get comments
router.get(
  "/:taskId/comments",
  canAccessTask,
  ctrl.getComments
);

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
  canAccessTask,
  ctrl.getSubTasks
);


// Edit comment
router.put(
  "/comments/:commentId",
  auth,
  ctrl.updateComment
);

// Task activity timeline
router.get(
  "/:taskId/activity",
  canAccessTask,
  ctrl.getTaskActivity
);

module.exports = router;
