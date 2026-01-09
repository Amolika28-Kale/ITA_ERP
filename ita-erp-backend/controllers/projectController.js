const Project = require("../models/Project");
const Team = require("../models/Team");

/* ================= CREATE PROJECT ================= */
exports.createProject = async (req, res) => {
  try {
    const { name, description, team, members = [] } = req.body;

    if (!name || !team) {
      return res.status(400).json({ message: "Name and team are required" });
    }

    const teamDoc = await Team.findById(team);
    if (!teamDoc || !teamDoc.isActive) {
      return res.status(400).json({ message: "Invalid or inactive team" });
    }

    // Ensure members belong to the team
    const validMembers = members.filter(m =>
      teamDoc.members.map(id => id.toString()).includes(m)
    );

    const project = await Project.create({
      name,
      description,
      team,
      members: validMembers,
      createdBy: req.user.id
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET PROJECTS ================= */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: { $ne: "archived" } })
      .populate("team", "name")
      .populate("members", "name email")
      .populate("createdBy", "name");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROJECT ================= */
exports.updateProject = async (req, res) => {
  try {
    const { name, description, members, status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members, status },
      { new: true }
    )
      .populate("team", "name")
      .populate("members", "name");

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ARCHIVE PROJECT ================= */
exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: "archived" },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROJECT STATUS ================= */
exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["active", "on-hold", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
