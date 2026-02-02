const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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
