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
