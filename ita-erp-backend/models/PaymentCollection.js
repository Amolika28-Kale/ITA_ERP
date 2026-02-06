import mongoose from "mongoose";

const paymentCollectionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: { type: String, required: true }, // ✅ Added for WhatsApp

    companyName: {
      type: String,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      required: true,
    },

    pendingAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    isPartPayment: {
      type: Boolean,
      default: false,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank", "card"],
      required: true,
    },

    referenceId: String,
    notes: String,

    collectionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentCollection", paymentCollectionSchema);
