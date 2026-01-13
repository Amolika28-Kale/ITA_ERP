const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    loginTime: {
      type: Date,
      required: true
    },

    logoutTime: {
      type: Date,
      default: null
    },

    totalMinutes: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["present", "half-day"],
      default: "present"
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
