const Task = require("../models/Task");
const Project = require("../models/Project");
const TaskComment = require("../models/TaskComment");
const { logActivity } = require("../utils/activityLogger");

/* ================= CREATE TASK ================= */
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      parentTask
    } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: "Title & project required" });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(400).json({ message: "Invalid project" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      parentTask: parentTask || null,
      createdBy: req.user.id
    });

    // 🔥 ACTIVITY
    await logActivity({
      entityType: "task",
      entityId: task._id,
      action: "created",
      message: `created task "${task.title}"`,
      userId: req.user.id,
      projectId: project
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ message: "Failed to create task" });
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

    await logActivity({
      entityType: "task",
      entityId: task._id,
      action: "updated",
      message: `updated task "${task.title}"`,
      userId: req.user.id,
      projectId: task.project
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
      projectId: task.project
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

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await logActivity({
      entityType: "task",
      entityId: task._id,
      action: "status",
      message: `changed status to "${status}"`,
      userId: req.user.id,
      projectId: task.project
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

    await logActivity({
      entityType: "task",
      entityId: task._id,
      action: "comment",
      message: "added a comment",
      userId: req.user.id,
      projectId: task.project
    });

    res.status(201).json(comment);
  } catch (err) {
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

    await logActivity({
      entityType: "task",
      entityId: parentTask._id,
      action: "subtask",
      message: `created subtask "${subtask.title}"`,
      userId: req.user.id,
      projectId: parentTask.project
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
