const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  requirement: { type: String, required: true },
  source: { 
    type: String, 
    enum: ["Google", "Facebook", "Reference", "Cold Call", "Walking", "Other"], // Added Walking
    default: "Cold Call" 
  },
  status: { 
    type: String, 
    enum: ["New", "Follow-up", "Quotation Sent", "Converted", "Lost"], 
    default: "New" 
  },
  nextFollowUpDate: { type: Date },
  lastActionTime: { type: Date }, // ✅ Added for auto-timing
  adminRemark: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Inquiry", inquirySchema);