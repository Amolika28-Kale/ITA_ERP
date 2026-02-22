import mongoose from "mongoose";

const staffReportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportText: { 
    type: String, 
    required: true 
  },
  timeSlot: {
    startTime: {
      type: String, // Format: "HH:mm" (24-hour)
      required: true
    },
    endTime: {
      type: String, // Format: "HH:mm" (24-hour)
      required: true
    },
    label: {
      type: String, // Optional display label e.g. "Morning Slot"
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("StaffReport", staffReportSchema);