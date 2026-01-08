const Project = require("../models/Project");

/**
 * CREATE PROJECT
 */

exports.createProject = async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    members: req.body.members,
    createdBy: req.user.id
  });
  res.status(201).json(project);
};

exports.getProjects = async (req, res) => {
  const projects = await Project.find()
    .populate("members", "name");
  res.json(projects);
};

exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      members: req.body.members
    },
    { new: true }
  );
  res.json(project);
};


/**
 * ARCHIVE PROJECT
 */
exports.archiveProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    { new: true }
  );
  res.json(project);
};
