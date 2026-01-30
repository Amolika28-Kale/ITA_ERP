const SelfTask = require("../models/SelfTask");
// Make sure this matches your actual utility export style
const { getTodayIST } = require("../utils/getToday"); 

// 1. Submit Morning Plan
// controllers/selfTaskController.js मधील हा भाग अपडेट करा

exports.submitMorningPlan = async (req, res) => {
  try {
    // फ्रंटएंडवरून जर { plannedTasks: "text" } येत असेल तर हे चालेल
    let { plannedTasks } = req.body;

    // जर 'plannedTasks' ऑब्जेक्ट स्वरूपात असेल, तर त्यातील स्ट्रिंग बाहेर काढा
    if (typeof plannedTasks === 'object') {
       plannedTasks = plannedTasks.plannedTasks;
    }

    if (!plannedTasks || typeof plannedTasks !== 'string') {
       return res.status(400).json({ message: "Planned tasks text is required" });
    }

    const today = getTodayIST();

    const record = await SelfTask.findOneAndUpdate(
      { user: req.user.id, date: today },
      { plannedTasks: plannedTasks.trim() }, // आता .trim() व्यवस्थित काम करेल
      { upsert: true, new: true }
    );

    res.json({ message: "Work plan activated successfully!", record });
  } catch (err) {
    console.error("Morning Plan Error:", err);
    res.status(500).json({ message: "Failed to save plan" });
  }
};

// 2. Submit Evening Achievement
exports.submitEveningAchievement = async (req, res) => {
  try {
    const { achievements } = req.body;
    
    // Safety Check: ensure achievements exists before trimming
    if (!achievements) return res.status(400).json({ message: "Achievement text is required" });

    const today = getTodayIST();

    const record = await SelfTask.findOneAndUpdate(
      { user: req.user.id, date: today },
      { achievements: achievements.trim() },
      { new: true } // Removed upsert: true because the plan MUST exist first
    );

    if (!record) {
      return res.status(404).json({ 
        message: "No work plan found for today. You must submit a plan in the morning first." 
      });
    }

    res.json({ message: "Achievements logged successfully!", record });
  } catch (err) {
    console.error("Evening Log Error:", err); // This will show you exactly why it failed in your terminal
    res.status(500).json({ message: "Failed to log achievements" });
  }
};

// 3. Check Status
exports.checkTodayStatus = async (req, res) => {
  try {
    const today = getTodayIST();
    const task = await SelfTask.findOne({ user: req.user.id, date: today });
    res.json({ 
      hasPlan: !!task?.plannedTasks, 
      hasAchievement: !!task?.achievements 
    });
  } catch (err) {
    res.status(500).json({ message: "Status check failed" });
  }
};