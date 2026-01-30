const Request = require("../models/Request");
const User = require("../models/User");
const { sendNotification } = require("../utils/notify");

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      ...req.body,
      user: req.user.id
    });

    // Wrap notification in a separate try/catch so it doesn't crash the main response
    try {
      const admins = await User.find({ role: "admin" }).select("_id");
      await sendNotification({
        users: admins.map(a => a._id),
        title: "New Request Submitted",
        message: `${req.user.name} submitted a ${request.requestType} request`,
        type: "request",
        entityType: "request",
        entityId: request._id,
        sendEmail: true
      });
    } catch (notificationError) {
      console.error("Notification Error:", notificationError);
    }

    // Always send the success response if the DB save worked
    res.status(201).json(request);
  } catch (err) {
    console.error("Validation/DB Error:", err);
    res.status(400).json({ message: err.message }); // 400 is better for validation errors
  }
};

exports.myRequests = async (req, res) => {
  const list = await Request.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(list);
};

exports.getRequestById = async (req, res) => {
  const doc = await Request.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!doc) return res.status(404).json({ message: "Not found" });
  if (doc.status !== "Pending")
    return res.status(403).json({ message: "Request locked" });

  res.json(doc);
};

exports.updateRequest = async (req, res) => {
  const doc = await Request.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!doc) return res.status(404).json({ message: "Not found" });
  if (doc.status !== "Pending")
    return res.status(403).json({ message: "Already processed" });

  Object.assign(doc, req.body);
  await doc.save();

  res.json({ message: "Updated successfully" });
};

exports.deleteRequest = async (req, res) => {
  const doc = await Request.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!doc) return res.status(404).json({ message: "Not found" });
  if (doc.status !== "Pending")
    return res.status(403).json({ message: "Cannot delete" });

  await doc.deleteOne();
  res.json({ message: "Deleted" });
};

exports.getAllRequests = async (req, res) => {
  const list = await Request.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(list);
};

exports.updateRequestStatus = async (req, res) => {
  const { status, adminRemark } = req.body;

  const doc = await Request.findById(req.params.id).populate("user");
  if (!doc) return res.status(404).json({ message: "Not found" });

  doc.status = status;
  doc.adminRemark = adminRemark;
  await doc.save();

  await sendNotification({
    users: [doc.user._id],
    title: `Request ${status}`,
    message: `Your ${doc.requestType} request has been ${status}`,
    type: "request",
    entityType: "request",
    entityId: doc._id,
    sendEmail: true
  });

  res.json({ message: "Updated successfully" });
};
