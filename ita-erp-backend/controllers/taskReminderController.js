// const Task = require("../models/Task");
// const mongoose = require("mongoose");

// exports.getPendingTaskReminder = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.user.id);

//     // 🧠 Normalize TODAY (00:00)
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const baseQuery = {
//       assignedTo: userId,
//       status: { $in: ["todo", "in-progress", "review"] },
//       dueDate: { $exists: true, $ne: null }
//     };

//     // 🔴 Overdue = before today
//     const overdueTasks = await Task.find({
//       ...baseQuery,
//       dueDate: { $lt: today }
//     }).select("_id title status dueDate");

//     // 🟡 Pending = today or future
//     const pendingTasks = await Task.find({
//       ...baseQuery,
//       dueDate: { $gte: today }
//     }).select("_id title status dueDate");

//     res.json({
//       pendingCount: pendingTasks.length,
//       overdueCount: overdueTasks.length,
//       pendingTasks,
//       overdueTasks
//     });
//   } catch (err) {
//     console.error("🔥 Reminder Error:", err);
//     res.status(500).json({ message: "Failed to fetch task reminder" });
//   }
// };

const Task = require("../models/Task");
const mongoose = require("mongoose");

exports.getPendingTaskReminder = async (req, res) => {
  try {
    // Check if req.user exists (Auth middleware check)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user.id; 

    // 🧠 Normalize TODAY (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Match the new Scratch Model: assignedTo is an Array, status is 'pending'
    const baseQuery = {
      assignedTo: { $in: [userId] }, // Use $in for Array support
      status: "pending",             // Matches simplified status
      taskType: "normal",            // Separates from daily tasks
      dueDate: { $exists: true, $ne: null }
    };

    // 🔴 Overdue = before today
    const overdueTasks = await Task.find({
      ...baseQuery,
      dueDate: { $lt: today }
    }).select("_id title status dueDate priority");

    // 🟡 Pending = today or future
    const pendingTasks = await Task.find({
      ...baseQuery,
      dueDate: { $gte: today }
    }).select("_id title status dueDate priority");

    res.json({
      pendingCount: pendingTasks.length,
      overdueCount: overdueTasks.length,
      pendingTasks,
      overdueTasks
    });
  } catch (err) {
    // This will show you exactly what is crashing in your VS Code Terminal
    console.error("🔥 Reminder Crash Log:", err); 
    res.status(500).json({ message: "Internal Server Error in Reminders", error: err.message });
  }
};