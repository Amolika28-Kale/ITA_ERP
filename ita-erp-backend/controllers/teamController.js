const Team = require("../models/Team");


exports.createTeam = async (req, res) => {
  const team = await Team.create({
    name: req.body.name,
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
    { name: req.body.name },
    { new: true }
  );
  res.json(team);
};


/**
 * DISABLE TEAM
 */
exports.disableTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  res.json(team);
};
