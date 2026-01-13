const Message = require("../models/Message");
const User = require("../models/User");
const { sendNotification } = require("../utils/notify");

/* ================= SEND MESSAGE ================= */
exports.sendMessage = async (req, res) => {
  try {
    const { title, body, sendToAll, recipients = [] } = req.body;

    let targetUsers = recipients;

    if (sendToAll) {
      const users = await User.find({ role: "employee" }).select("_id");
      targetUsers = users.map(u => u._id);
    }

    const message = await Message.create({
      sender: req.user.id,
      recipients: targetUsers,
      isBroadcast: sendToAll,
      title,
      body
    });

    // 🔔 Notifications
    await sendNotification({
      users: targetUsers,
      title,
      message: body,
      type: "message",
      entityType: "chat",
      entityId: message._id
    });

    res.json({ success: true, message });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* ================= ADMIN SENT HISTORY ================= */
exports.getSentMessages = async (req, res) => {
  const messages = await Message.find({ sender: req.user.id })
    .sort({ createdAt: -1 })
    .populate("recipients", "name email");

  res.json(messages);
};

/* ================= EMPLOYEE INBOX ================= */
exports.getInbox = async (req, res) => {
  const messages = await Message.find({
    recipients: req.user.id
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name");

  res.json(messages);
};

/* ================= MESSAGE DETAILS ================= */
exports.getMessageById = async (req, res) => {
  const message = await Message.findById(req.params.id)
    .populate("sender", "name")
    .populate("recipients", "name email");

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  res.json(message);
};
