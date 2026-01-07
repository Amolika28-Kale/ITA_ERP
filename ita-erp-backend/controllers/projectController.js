const Project = require("../models/Project");

exports.createProject = async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user.id
  });
  res.status(201).json(project);
};

exports.getProjects = async (req, res) => {
  const projects = await Project.find().populate("members", "name email");
  res.json(projects);
};

exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(project);
};
