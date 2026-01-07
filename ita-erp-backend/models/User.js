const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "manager", "employee"],
    default: "employee"
  },
  isActive: { type: Boolean, default: true },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
