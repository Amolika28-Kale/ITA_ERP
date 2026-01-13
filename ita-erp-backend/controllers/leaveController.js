import Leave from "../models/Leave.js";
import Notification from "../models/Notification.js";
import { sendNotification } from "../utils/notify.js";

/* ================= EMPLOYEE ================= */

// Apply leave / request
export const applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create({
      ...req.body,
      employee: req.user.id
    });

    // 🔔 Notify Admins
    await Notification.create({
      title: "New Leave Request",
      message: `${req.user.name} submitted a leave request`,
      role: "admin"
    });

    res.status(201).json(leave);
  } catch (err) {
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

// Approve / Reject
export const updateLeaveStatus = async (req, res) => {
  const { status, adminComment } = req.body;

  const leave = await Leave.findByIdAndUpdate(
    req.params.id,
    { status, adminComment },
    { new: true }
  ).populate("employee");

  // 🔔 Notify Employee
  await sendNotification.create({
    title: "Leave Status Updated",
    message: `Your leave has been ${status}`,
    user: leave.employee._id
  });

  res.json(leave);
};
