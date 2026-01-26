const Task = require("../models/Task");
const Project = require("../models/Project");
const TaskComment = require("../models/TaskComment");
const { logActivity } = require("../utils/activityLogger");
const ActivityLog = require("../models/ActivityLog");
const { sendNotification } = require("../utils/notify");

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res) => {
  try {
    let {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      parentTask,
      taskType = "personal"
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    // ✅ Validate project ONLY if provided
    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return res.status(400).json({ message: "Invalid project" });
      }
    }

    // ✅ ADMIN SELF ASSIGN
    if (assignedTo === "self" || !assignedTo) {
      assignedTo = req.user.id;
    }

    const task = await Task.create({
      title,
      description,
      project: project || null,
      assignedTo,
      priority,
      dueDate,
      parentTask: parentTask || null,
      createdBy: req.user.id,
      taskType
    });

    await sendNotification({
      users: [task.assignedTo].filter(Boolean),
      title: "New Task Assigned",
      message: `You were assigned "${task.title}"`,
      type: "task",
      entityId: task._id
    });

    await logActivity({
      entityType: "task",
      entityId: task._id,
      action: "created",
      message: `created task "${task.title}"`,
      userId: req.user.id,
      visibleTo: [req.user.id, task.assignedTo].filter(Boolean)
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
};




/* ================= GET MY TASKS ================= */
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id
    })
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};


exports.getTaskDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name")
      .populate("project", "name")
      .populate("parentTask", "title");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtasks = await Task.find({ parentTask: task._id })
      .populate("assignedTo", "name");

    const comments = await TaskComment.find({ task: task._id })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    res.json({ task, subtasks, comments });
  } catch (err) {
    res.status(500).json({ message: "Failed to load task" });
  }
};


/* ================= GET TASKS BY PROJECT ================= */
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find(req.taskFilter)
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .populate("parentTask", "title");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
// Employee: Get today's tasks (not completed today)
exports.getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      assignedTo: req.user.id,
      dueDate: {
        $gte: today,
        $lt: tomorrow
      },
      completedDates: {
        $ne: today
      }
    }).select("title dueDate");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load daily tasks" });
  }
};


exports.getAdminDailyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      isDaily: true,
      dueDate: {
        $gte: new Date().setHours(0,0,0,0)
      }
    })
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load daily tasks" });
  }
};

// Mark task as done for today
exports.markTaskDoneToday = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    if (!task.completedDates.some(d => d.getTime() === today.getTime())) {
      task.completedDates.push(today);
      await task.save();
    }

    res.json({ message: "Task completed for today" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};


/* ================= UPDATE TASK ================= */
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await sendNotification({
      users: [task.createdBy, task.assignedTo].filter(Boolean),
      title: "Task Updated",
      message: `"${task.title}" was updated`,
      type: "task",
      entityType: "task",
      entityId: task._id
    });

await logActivity({
  entityType: "task",
  entityId: task._id,
  action: "updated",
  message: `updated task "${task.title}"`,
  userId: req.user.id,
  visibleTo: [
    task.createdBy,
    task.assignedTo,
  ].filter(Boolean),
});


    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
};

/* ================= DELETE TASK ================= */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.deleteOne({ _id: task._id });

await logActivity({
  entityType: "task",
  entityId: task._id,
  action: "deleted",
  message: `deleted task "${task.title}"`,
  userId: req.user.id,
  visibleTo: [
    task.createdBy,
    task.assignedTo,
  ].filter(Boolean),
});


    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
};

/* ================= UPDATE TASK STATUS ================= */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["todo", "in-progress", "review", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔒 EMPLOYEE RESTRICTION
    if (
      req.user.role === "employee" &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status;
    await task.save();

     const notifyUsers = [task.createdBy, task.assignedTo]
      .filter(Boolean)
      .filter(id => id.toString() !== req.user.id);

    await sendNotification({
      users: notifyUsers,
      title: "Task Status Updated",
      message: `"${task.title}" moved to ${status}`,
      type: "task",
      entityType: "task",
      entityId: task._id
    });



await logActivity({
  entityType: "task",
  entityId: task._id,
  action: "status",
  message: `changed status to "${status}"`,
  userId: req.user.id,
  visibleTo: [
    task.createdBy,
    task.assignedTo,
  ].filter(Boolean),
});


    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};


/* ================= ADD COMMENT ================= */
exports.addComment = async (req, res) => {
  try {
    if (!req.body.message?.trim()) {
      return res.status(400).json({ message: "Comment required" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = await TaskComment.create({
      task: task._id,
      user: req.user.id,
      message: req.body.message
    });

    const notifyUsers = [task.createdBy, task.assignedTo]
      .filter(Boolean)
      .filter(id => id.toString() !== req.user.id);

    // ✅ FIXED
    await sendNotification({
      users: notifyUsers,
      title: "New Comment",
      message: `New comment on "${task.title}"`,
      type: "task",
      entityType: "task",
      entityId: task._id
    });

    await logActivity({
      entityType: "comment",
      entityId: comment._id,
      action: "comment",
      message: "added a comment",
      userId: req.user.id,
      visibleTo: [task.createdBy, task.assignedTo].filter(Boolean),
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};


/* ================= GET COMMENTS ================= */
exports.getComments = async (req, res) => {
  try {
    const comments = await TaskComment.find({
      task: req.params.taskId
    }).populate("user", "name");

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// ================= UPDATE COMMENT ================= */
exports.updateComment = async (req, res) => {
  try {
    const comment = await TaskComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.message = req.body.message;
    await comment.save();

    const task = await Task.findById(comment.task);

    await logActivity({
      entityType: "comment",
      entityId: comment._id,
      action: "comment-edit",
      message: "edited a comment",
      userId: req.user.id,
      visibleTo: [task.createdBy, task.assignedTo].filter(Boolean)
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update comment" });
  }
};

/* ================= CREATE SUBTASK ================= */
exports.createSubTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { parentTaskId } = req.params;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const parentTask = await Task.findById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({ message: "Parent task not found" });
    }

    const subtask = await Task.create({
      title,
      description,
      project: parentTask.project,
      parentTask: parentTaskId,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user.id
    });

    await sendNotification({
  user: parentTask.assignedTo,
  title: "New Subtask Created",
  message: `Subtask "${subtask.title}" added`,
  type: "task",
  entityType: "subtask",
  entityId: subtask._id
});


await logActivity({
  entityType: "subtask",
  entityId: subtask._id,
  action: "created",
  message: `created subtask "${subtask.title}"`,
  userId: req.user.id,
  projectId: parentTask.project,
  visibleTo: [
    parentTask.createdBy,
    parentTask.assignedTo,
    subtask.assignedTo,
  ].filter(Boolean),
});


    res.status(201).json(subtask);
  } catch (err) {
    res.status(500).json({ message: "Failed to create subtask" });
  }
};

/* ================= GET SUBTASKS ================= */
exports.getSubTasks = async (req, res) => {
  try {
    const subtasks = await Task.find({
      parentTask: req.params.parentTaskId
    })
      .populate("assignedTo", "name")
      .sort({ createdAt: 1 });

    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subtasks" });
  }
};


// ================= GET TASK ACTIVITY ================= */
exports.getTaskActivity = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const logs = await ActivityLog.find({
      visibleTo: req.user.id
    })
      .populate("performedBy", "name")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load task activity" });
  }
};

