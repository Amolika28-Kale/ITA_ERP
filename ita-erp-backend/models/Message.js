const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    isBroadcast: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      required: true
    },

    body: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
