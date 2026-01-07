const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
