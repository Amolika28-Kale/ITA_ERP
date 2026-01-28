const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["Leave", "Asset", "Support", "Approval", "Complaint", "Other"],
    default: "Other"
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  status: {
    type: String,
    enum: ["Pending", "In Progress", "Approved", "Rejected"],
    default: "Pending"
  },

  adminRemark: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Requirement", requirementSchema);
