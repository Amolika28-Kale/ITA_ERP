import Leave from "../models/Leave.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/notify.js";

/* ================= EMPLOYEE ================= */

// Apply leave / request
export const applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      employee: req.user.id
    });

    /* 🔔 Notify ALL Admins */
    const admins = await User.find({ role: "admin" }).select("_id");

    await sendNotification({
      users: admins.map(a => a._id),
      title: "New Leave Request",
      message: `${req.user.name} submitted a ${leave.type} request`,
      type: "leave",
      entityType: "leave",
      entityId: leave._id
    });

    res.status(201).json(leave);
  } catch (err) {
    console.error("Apply leave error:", err);
    res.status(500).json({ message: err.message });
  }
};

// My leaves
export const myLeaves = async (req, res) => {
  const leaves = await Leave.find({ employee: req.user.id })
    .sort({ createdAt: -1 });

  res.json(leaves);
};

/* ================= ADMIN ================= */

// All leave requests
export const getAllLeaves = async (req, res) => {
  const leaves = await Leave.find()
    .populate("employee", "name email")
    .sort({ createdAt: -1 });

  res.json(leaves);
};

// Approve / Reject leave
export const updateLeaveStatus = async (req, res) => {
  const { status, adminComment } = req.body;

  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status, adminComment },
    { new: true }
  ).populate("employee");

  if (!leave) {
    return res.status(404).json({ message: "Leave not found" });
  }

  /* 🔔 Notify Employee */
  await sendNotification({
    users: [leave.employee._id],
    title: "Leave Status Updated",
    message: `Your ${leave.type} request has been ${status}`,
    type: "leave",
    entityType: "leave",
    entityId: leave._id
  });

  res.json(leave);
};
