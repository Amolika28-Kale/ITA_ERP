const mongoose = require("mongoose");

const selfTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD (IST)
    required: true
  },
  plannedTasks: {
    type: String,
    required: true // सकाळी लॉगिन वेळी भरणे बंधनकारक
  },
  achievements: {
    type: String // संध्याकाळी लॉगआउट वेळी भरणे बंधनकारक
  }
}, { timestamps: true });

// एका दिवसासाठी एका युजरचा एकच रेकॉर्ड असावा
selfTaskSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("SelfTask", selfTaskSchema);