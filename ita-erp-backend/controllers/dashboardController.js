const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");
const Task = require("../models/Task"); // ✅ REQUIRED

/* ================= ADMIN DASHBOARD ================= */
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
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Admin dashboard error" });
  }
};

/* ================= EMPLOYEE DASHBOARD ================= */
exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const todo = await Task.countDocuments({ assignedTo: userId, status: "todo" });
    const inProgress = await Task.countDocuments({ assignedTo: userId, status: "in-progress" });
    const completed = await Task.countDocuments({ assignedTo: userId, status: "completed" });

    res.json({
      totalTasks,
      todo,
      inProgress,
      completed
    });
  } catch (err) {
    console.error("Employee dashboard error:", err);
    res.status(500).json({ message: "Employee dashboard error" });
  }
};
