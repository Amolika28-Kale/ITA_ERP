const SelfTask = require("../models/SelfTask");
const { getTodayIST } = require("../utils/getToday"); 

// 1. Submit Morning Plan
exports.submitMorningPlan = async (req, res) => {
  try {
    let { plannedTasks } = req.body;

    if (typeof plannedTasks === 'object') {
       plannedTasks = plannedTasks.plannedTasks;
    }

    if (!plannedTasks || typeof plannedTasks !== 'string') {
       return res.status(400).json({ message: "Planned tasks text is required" });
    }

    const today = getTodayIST();

    const record = await SelfTask.findOneAndUpdate(
      { user: req.user.id, date: today },
      { plannedTasks: plannedTasks.trim() },
      { upsert: true, new: true }
    );

    res.json({ 
      message: "Work plan activated successfully!", 
      record,
      plannedTasks: record.plannedTasks // Return the plan text
    });
  } catch (err) {
    console.error("Morning Plan Error:", err);
    res.status(500).json({ message: "Failed to save plan" });
  }
};

// 2. Submit Evening Achievement
exports.submitEveningAchievement = async (req, res) => {
  try {
    const { achievements } = req.body;
    
    if (!achievements) return res.status(400).json({ message: "Achievement text is required" });

    const today = getTodayIST();

    const record = await SelfTask.findOneAndUpdate(
      { user: req.user.id, date: today },
      { achievements: achievements.trim() },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ 
        message: "No work plan found for today. You must submit a plan in the morning first." 
      });
    }

    res.json({ 
      message: "Achievements logged successfully!", 
      record,
      achievements: record.achievements
    });
  } catch (err) {
    console.error("Evening Log Error:", err);
    res.status(500).json({ message: "Failed to log achievements" });
  }
};

// 3. Check Status - UPDATED to return full task data
exports.checkTodayStatus = async (req, res) => {
  try {
    const today = getTodayIST();
    const task = await SelfTask.findOne({ user: req.user.id, date: today });
    
    // Return full task data, not just booleans
    res.json({ 
      hasPlan: !!task?.plannedTasks, 
      hasAchievement: !!task?.achievements,
      plannedTasks: task?.plannedTasks || null,  // Add this
      achievements: task?.achievements || null,   // Add this
      task: task || null
    });
  } catch (err) {
    console.error("Status check failed:", err);
    res.status(500).json({ message: "Status check failed" });
  }
};

// 4. Get Today's Plan (optional separate endpoint)
exports.getTodayPlan = async (req, res) => {
  try {
    const today = getTodayIST();
    const task = await SelfTask.findOne({ user: req.user.id, date: today });
    
    if (!task) {
      return res.status(404).json({ message: "No plan found for today" });
    }
    
    res.json({
      plannedTasks: task.plannedTasks,
      achievements: task.achievements,
      hasPlan: true,
      hasAchievement: !!task.achievements
    });
  } catch (err) {
    console.error("Error fetching today's plan:", err);
    res.status(500).json({ message: "Failed to fetch today's plan" });
  }
};