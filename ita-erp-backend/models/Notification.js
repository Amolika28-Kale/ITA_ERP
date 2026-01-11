const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["task", "project", "comment", "system"],
      default: "system"
    },
    entityType: {
      type: String,
      enum: ["task", "project", "comment", "subtask"]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
