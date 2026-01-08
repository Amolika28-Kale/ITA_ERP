const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: String,
    description: String,

    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
