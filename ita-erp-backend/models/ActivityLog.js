const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ["task", "subtask", "comment", "project"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },

    // 🔥 NEW: who can see this activity
    visibleTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
