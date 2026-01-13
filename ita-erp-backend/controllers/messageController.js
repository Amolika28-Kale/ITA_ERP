const Message = require("../models/Message");
const User = require("../models/User");
const { sendNotification } = require("../utils/notify");


// ADMIN → SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
    const { title, body, recipients, sendToAll } = req.body;

    let users = [];

    if (sendToAll) {
      users = await User.find({ role: "employee" }).select("_id");
    } else {
      users = await User.find({
        _id: { $in: recipients }
      }).select("_id");
    }

    if (!users.length) {
      return res.status(400).json({ message: "No users found" });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipients: users.map(u => u._id),
      isBroadcast: sendToAll,
      title,
      body
    });

    // 🔔 USE EXISTING NOTIFICATION SYSTEM
    await sendNotification({
      users: users.map(u => u._id),
      title: "📢 New Message",
      message: title,
      type: "message",
      entityType: "chat",
      entityId: message._id
    });

    res.json({ success: true, message: "Message sent" });

  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};


// EMPLOYEE → GET MY MESSAGES
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      recipients: req.user.id
    })
      .populate("sender", "name role")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
