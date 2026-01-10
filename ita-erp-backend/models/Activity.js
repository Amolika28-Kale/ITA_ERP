const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    action: String,
    message: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
