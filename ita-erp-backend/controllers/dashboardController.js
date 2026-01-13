const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");
const Task = require("../models/Task");

/* ================= ADMIN STATS ================= */
exports.getAdminStats = async (req, res) => {
  try {
    const [
      users,
      teams,
      projects,
      activeProjects
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Project.countDocuments(),
      Project.countDocuments({ status: "active" })
    ]);

    res.json({
      users,
      teams,
      projects,
      activeProjects
    });
  } catch (err) {
    res.status(500).json({ message: "Admin dashboard error" });
  }
};

/* ================= EMPLOYEE STATS ================= */
exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalTasks, todo, inProgress, completed] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: "todo" }),
      Task.countDocuments({ assignedTo: userId, status: "in-progress" }),
      Task.countDocuments({ assignedTo: userId, status: "completed" })
    ]);

    res.json({
      totalTasks,
      todo,
      inProgress,
      completed
    });
  } catch (err) {
    res.status(500).json({ message: "Employee dashboard error" });
  }
};

/* ================= EMPLOYEE PENDING TASKS ================= */
exports.employeePendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
      status: { $ne: "completed" }
    })
      .populate("project", "name")
      .sort({ dueDate: 1 });

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load pending tasks" });
  }
};

/* ================= ADMIN / MANAGER PENDING ================= */
/* ================= ADMIN PENDING TASKS ================= */
exports.getAdminPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      status: { $in: ["todo", "in-progress"] }
    })
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ dueDate: 1 })
      .limit(20);

    res.json(tasks);
  } catch (err) {
    console.error("Pending task error:", err);
    res.status(500).json({ message: "Failed to load pending tasks" });
  }
};
