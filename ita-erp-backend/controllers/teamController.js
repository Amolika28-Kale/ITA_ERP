const Team = require("../models/Team");

exports.createTeam = async (req, res) => {
  const team = await Team.create({
    ...req.body,
    createdBy: req.user.id
  });
  res.status(201).json(team);
};

exports.getTeams = async (req, res) => {
  const teams = await Team.find();
  res.json(teams);
};
exports.updateTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(team);
};

