const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");

exports.getAdminStats = async (req, res) => {
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
};


exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Task.countDocuments({ assignedTo: userId });
    const todo = await Task.countDocuments({ assignedTo: userId, status: "todo" });
    const inProgress = await Task.countDocuments({ assignedTo: userId, status: "in-progress" });
    const completed = await Task.countDocuments({ assignedTo: userId, status: "completed" });

    res.json({
      totalTasks: total,
      todo,
      inProgress,
      completed
    });
  } catch (err) {
    res.status(500).json({ message: "Employee dashboard error" });
  }
};
