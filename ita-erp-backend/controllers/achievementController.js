// controllers/achievementController.js
const DailyAchievement = require("../models/DailyAchievement");
const getTodayIST = require("../utils/getTodayIST");

exports.submitAchievement = async (req, res) => {
  try {
    const { achievement } = req.body;

    if (!achievement || achievement.trim().length < 5) {
      return res.status(400).json({
        message: "Achievement is required"
      });
    }

    const today = getTodayIST();

    const record = await DailyAchievement.findOneAndUpdate(
      { user: req.user.id, date: today },
      { achievement: achievement.trim() },
      { upsert: true, new: true }
    );

    res.json({
      message: "Achievement submitted successfully",
      record
    });
  } catch (err) {
    console.error("Achievement Error:", err);
    res.status(500).json({
      message: "Failed to submit achievement"
    });
  }
};

