const Team = require("../models/Team");

/* ================= CREATE TEAM ================= */
exports.createTeam = async (req, res) => {
  try {
    const { name, description, leader } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const exists = await Team.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Team already exists" });
    }

    const team = await Team.create({
      name,
      description,
      leader,
      members: leader ? [leader] : [],
      createdBy: req.user.id
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TEAMS ================= */
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate("leader", "name email")
      .populate("members", "name email");

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TEAM ================= */
exports.updateTeam = async (req, res) => {
  try {
    const { name, description, leader, members } = req.body;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        leader,
        members: leader
          ? Array.from(new Set([leader, ...(members || [])]))
          : members
      },
      { new: true }
    )
      .populate("leader", "name")
      .populate("members", "name");

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DISABLE TEAM ================= */
exports.disableTeam = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can disable teams" });
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
