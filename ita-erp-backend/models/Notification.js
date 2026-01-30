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
      enum: [
        "task",
        "comment",
        "attendance",
        "leave",
        "message",
        "requirement",
        "payment",
        "request",
        "system"
      ],
      default: "system"
    },

    entityType: {
      type: String,
      enum: ["task", "project", "attendance", "leave", "chat", "requirement","payment" , "request"],
      default: null
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

