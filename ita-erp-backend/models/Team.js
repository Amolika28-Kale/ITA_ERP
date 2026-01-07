const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);
