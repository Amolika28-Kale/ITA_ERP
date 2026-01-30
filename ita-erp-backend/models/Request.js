const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    requestType: {
      type: String,
      enum: [
        "Leave",
        "Permission",
        "Asset",
        "Support",
        "Approval",
        "Complaint",
        "Other"
      ],
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

    // Only for Leave / Permission
    fromDate: Date,
    toDate: Date,

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

    adminRemark: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
