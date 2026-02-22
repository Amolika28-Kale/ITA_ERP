const mongoose = require("mongoose");  // Changed from import
const Team = require("../models/Team.js");  // Changed from import
const User = require("../models/User.js");  // Changed from import

/* ================= CREATE TEAM ================= */
exports.createTeam = async (req, res) => {
  try {
    const { name, description, leader } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const exists = await Team.findOne({ name, isActive: true });
    if (exists) {
      return res.status(400).json({ message: "Team already exists" });
    }

    const team = await Team.create({
      name,
      description,
      leader,
      members: leader ? [leader] : [],
      createdBy: req.user.id,
      memberCount: leader ? 1 : 0
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "name email profileImage")
      .populate("members", "name email profileImage");

    res.status(201).json(populatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TEAMS ================= */
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate("leader", "name email profileImage role")
      .populate("members", "name email profileImage role")
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET SINGLE TEAM ================= */
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("leader", "name email profileImage role")
      .populate("members", "name email profileImage role");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TEAM ================= */
exports.updateTeam = async (req, res) => {
  try {
    const { name, description, leader } = req.body;

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        leader
      },
      { new: true }
    )
      .populate("leader", "name email profileImage")
      .populate("members", "name email profileImage");

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD MEMBER TO TEAM ================= */
exports.addMember = async (req, res) => {
  console.log("📝 addMember called");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("User:", req.user?.id);
  
  try {
    const { userId } = req.body;
    const teamId = req.params.id;

    // Validate inputs
    if (!userId) {
      console.log("❌ No userId provided");
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!teamId) {
      console.log("❌ No teamId provided");
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Check if user exists
    console.log("🔍 Finding user:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Find team
    console.log("🔍 Finding team:", teamId);
    const team = await Team.findById(teamId);
    if (!team) {
      console.log("❌ Team not found:", teamId);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("✅ Team found:", team.name);
    console.log("Current members:", team.members);
    console.log("Current leader:", team.leader);

    // Check if user is already a member
    const isMember = team.members.some(m => m.toString() === userId);
    const isLeader = team.leader && team.leader.toString() === userId;
    
    if (isMember || isLeader) {
      console.log("❌ User already in team");
      return res.status(400).json({ message: "User is already in this team" });
    }

    // Add member
    team.members.push(userId);
    team.memberCount = team.members.length;
    await team.save();
    console.log("✅ Member added. New members count:", team.members.length);

    // Get updated team with populated fields
    const updatedTeam = await Team.findById(teamId)
      .populate("leader", "name email profileImage role")
      .populate("members", "name email profileImage role");

    console.log("✅ Updated team ready");
    res.json(updatedTeam);
    
  } catch (err) {
    console.error("❌ Error in addMember:", err);
    res.status(500).json({ 
      message: "Error adding member to team",
      error: err.message 
    });
  }
};

/* ================= REMOVE MEMBER FROM TEAM ================= */
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Remove member
    team.members = team.members.filter(
      member => member.toString() !== userId
    );
    team.memberCount = team.members.length;
    await team.save();

    const updatedTeam = await Team.findById(teamId)
      .populate("leader", "name email profileImage role")
      .populate("members", "name email profileImage role");

    res.json(updatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET EMPLOYEES NOT IN TEAM ================= */
exports.getAvailableEmployees = async (req, res) => {
  console.log("🚀 getAvailableEmployees called");
  console.log("Params:", req.params);
  console.log("Team ID from params:", req.params.id);
  
  try {
    const teamId = req.params.id;
    
    // Validate team ID
    if (!teamId) {
      console.log("❌ No team ID provided");
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      console.log("❌ Invalid team ID format:", teamId);
      return res.status(400).json({ message: "Invalid team ID format" });
    }

    console.log("🔍 Finding team with ID:", teamId);
    const team = await Team.findById(teamId);
    
    if (!team) {
      console.log("❌ Team not found with ID:", teamId);
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("✅ Team found:", team.name);

    // Get all active users
    console.log("🔍 Finding all active users...");
    const allUsers = await User.find({ isActive: true })
      .select("name email profileImage role")
      .lean();

    console.log(`📊 Found ${allUsers.length} total active users`);

    // Get team member IDs
    const teamMemberIds = [];
    if (team.leader) {
      teamMemberIds.push(team.leader.toString());
      console.log("Team leader ID:", team.leader.toString());
    }
    
    if (team.members && team.members.length) {
      team.members.forEach(m => {
        teamMemberIds.push(m.toString());
        console.log("Team member ID:", m.toString());
      });
    }

    console.log("👥 Total team member IDs:", teamMemberIds.length);

    // Filter out users already in the team
    const availableEmployees = allUsers.filter(user => {
      const isInTeam = teamMemberIds.includes(user._id.toString());
      return !isInTeam;
    });

    console.log(`✅ Found ${availableEmployees.length} available employees`);

    res.json(availableEmployees);
  } catch (err) {
    console.error("❌ Error in getAvailableEmployees:", err);
    res.status(500).json({ 
      message: "Error fetching available employees",
      error: err.message 
    });
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