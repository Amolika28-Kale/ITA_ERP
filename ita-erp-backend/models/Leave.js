import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["leave", "wfh", "permission"],
      default: "leave"
    },

    reason: {
      type: String,
      required: true
    },

    fromDate: Date,
    toDate: Date,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    adminComment: String
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
