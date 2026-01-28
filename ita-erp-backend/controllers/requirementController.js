const Requirement = require("../models/Requirement");
const User = require("../models/User");
const { sendNotification } = require("../utils/notify");


//Employee → Create Requirement
exports.createRequirement = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & description required" });
    }

    const requirement = await Requirement.create({
      user: req.user.id,
      title,
      description,
      category,
      priority
    });

    // 🔔 Find all admins
    const admins = await User.find({ role: "admin" }).select("_id");

    await sendNotification({
      users: admins.map(a => a._id),
      title: "New Requirement Submitted",
      message: `${req.user.name} submitted a new requirement: ${title}`,
      type: "requirement",
      entityType: "Requirement",
      entityId: requirement._id,
      sendEmail: true
    });

    res.status(201).json({
      message: "Requirement submitted successfully",
      requirement
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit requirement" });
  }
};


//Employee → My Requirements
exports.myRequirements = async (req, res) => {
  const list = await Requirement.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(list);
};

// Employee → Get single requirement (for edit)
exports.getRequirementById = async (req, res) => {
  try {
    const reqDoc = await Requirement.findOne({
      _id: req.params.id,
      user: req.user.id, // 🔐 only own request
    });

    if (!reqDoc) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // ❌ Admin already processed → no edit
    if (reqDoc.status !== "Pending") {
      return res.status(403).json({ message: "Request is locked" });
    }

    res.json(reqDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load requirement" });
  }
};

// Employee → Update Requirement (only if Pending)
exports.updateRequirement = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const reqDoc = await Requirement.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!reqDoc) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    if (reqDoc.status !== "Pending") {
      return res.status(403).json({ message: "Request already processed" });
    }

    reqDoc.title = title;
    reqDoc.description = description;
    reqDoc.category = category;
    reqDoc.priority = priority;

    await reqDoc.save();

    res.json({ message: "Requirement updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};



// Employee → Delete Requirement (only if Pending)
exports.deleteRequirement = async (req, res) => {
  const reqDoc = await Requirement.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!reqDoc) return res.status(404).json({ message: "Not found" });

  if (reqDoc.status !== "Pending") {
    return res.status(403).json({ message: "Cannot delete processed request" });
  }

  await reqDoc.deleteOne();
  res.json({ message: "Deleted successfully" });
};


//Admin → View All Requirements
exports.getAllRequirements = async (req, res) => {
  const list = await Requirement.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(list);
};
//Admin → Update Status
exports.updateRequirementStatus = async (req, res) => {
  const { status, adminRemark } = req.body;

  const reqDoc = await Requirement.findById(req.params.id).populate("user");
  if (!reqDoc) return res.status(404).json({ message: "Not found" });

  reqDoc.status = status;
  reqDoc.adminRemark = adminRemark;
  await reqDoc.save();

  // 🔔 Notify employee
  await sendNotification({
    users: [reqDoc.user._id],
    title: `Requirement ${status}`,
    message: `
      Your request "${reqDoc.title}" has been ${status}.
      ${adminRemark ? `Remark: ${adminRemark}` : ""}
    `,
    type: "requirement",
    entityType: "requirement",
    entityId: reqDoc._id,
    sendEmail: true
  });

  res.json({ message: "Updated successfully" });
};

