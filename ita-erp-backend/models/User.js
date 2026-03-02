// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: function () {
        return this.provider !== "google";
      }
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },
    googleAccessToken: String,
    googleRefreshToken: String,
    
    // Personal Details - नवीन fields
    phone: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    joiningDate: { type: Date, default: Date.now },
    department: { type: String, default: "" },
    
    // Bank Details - नवीन
    bankDetails: {
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" }
    },
    
    // Personal Preferences - नवीन
    personalWishlist: { type: String, default: "" },
    expectationsFromITA: { type: String, default: "" },

    // Role & Status
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    otp: String,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    resetOtp: String,
    resetOtpExpiry: Date,
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);