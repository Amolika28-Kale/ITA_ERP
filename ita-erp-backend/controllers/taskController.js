const Task = require("../models/Task");
const Project = require("../models/Project");
const taskComment = require("../models/taskComment");

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

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TASKS BY PROJECT ================= */
exports.getTasksByProject = async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId })
    .populate("assignedTo", "name")
    .populate("createdBy", "name")
    .populate("parentTask", "title");

  res.json(tasks);
};

/* ================= UPDATE TASK ================= */
exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
};

/* ================= DELETE TASK ================= */
exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
};

/* ================= UPDATE TASK STATUS (KANBAN) ================= */
exports.updateTaskStatus = async (req, res) => {
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

  res.json(task);
};

/* ================= ADD COMMENT ================= */
exports.addComment = async (req, res) => {
  if (!req.body.message?.trim()) {
    return res.status(400).json({ message: "Comment required" });
  }

  const comment = await taskComment.create({
    task: req.params.taskId,
    user: req.user.id,
    message: req.body.message
  });

  res.status(201).json(comment);
};

/* ================= GET COMMENTS ================= */
exports.getComments = async (req, res) => {
  const comments = await TaskComment.find({
    task: req.params.taskId
  }).populate("user", "name");

  res.json(comments);
};
