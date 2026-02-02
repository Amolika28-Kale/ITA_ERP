import mongoose from "mongoose";

const staffReportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportText: { 
    type: String, 
    required: true // स्टाफने मॅन्युअली टाईप केलेला डेटा
  },
  intervalSlot: {
    type: String, // उदा. "0-3 hrs", "3-6 hrs" इत्यादी ओळखण्यासाठी
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("StaffReport", staffReportSchema);