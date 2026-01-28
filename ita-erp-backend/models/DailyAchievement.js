// models/DailyAchievement.js
const mongoose = require("mongoose");

const dailyAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD (IST)
    required: true
  },
  achievement: {
    type: String,
    required: true
  }
}, { timestamps: true });

dailyAchievementSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyAchievement", dailyAchievementSchema);
