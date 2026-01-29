import mongoose from "mongoose";

const paymentCollectionSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  clientName: {
    type: String,
    required: true,
    trim: true
  },

  companyName: {
    type: String,
    trim: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMode: {
    type: String,
    enum: ["cash", "upi", "bank"],
    required: true
  },

  referenceId: {   // UPI / Bank ref
    type: String
  },

  notes: {
    type: String
  },

  collectionDate: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("PaymentCollection", paymentCollectionSchema);
