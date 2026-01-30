// const User = require("../models/User");
// const Team = require("../models/Team");
// // const Project = require("../models/Project");
// const Task = require("../models/Task");

// /* ================= ADMIN STATS ================= */
// exports.getAdminStats = async (req, res) => {
//   try {
//     const [
//       users,
//       teams,
//       projects,
//       activeProjects
//     ] = await Promise.all([
//       User.countDocuments(),
//       Team.countDocuments(),
//       Project.countDocuments(),
//       Project.countDocuments({ status: "active" })
//     ]);

//     res.json({
//       users,
//       teams,
//       projects,
//       activeProjects
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Admin dashboard error" });
//   }
// };

// // /* ================= EMPLOYEE STATS ================= */
// exports.employeeDashboard = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const [totalTasks, todo, inProgress, completed] = await Promise.all([
//       Task.countDocuments({ assignedTo: userId }),
//       Task.countDocuments({ assignedTo: userId, status: "todo" }),
//       Task.countDocuments({ assignedTo: userId, status: "in-progress" }),
//       Task.countDocuments({ assignedTo: userId, status: "completed" })
//     ]);

//     res.json({
//       totalTasks,
//       todo,
//       inProgress,
//       completed
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Employee dashboard error" });
//   }
// };

// // /* ================= EMPLOYEE PENDING TASKS ================= */
// // exports.employeePendingTasks = async (req, res) => {
// //   try {
// //     const tasks = await Task.find({
// //       assignedTo: req.user.id,
// //       status: { $ne: "completed" }
// //     })
// //       .populate("project", "name")
// //       .sort({ dueDate: 1 });

// //     res.json({
// //       count: tasks.length,
// //       tasks
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Failed to load pending tasks" });
// //   }
// // };

// // /* ================= ADMIN PENDING TASKS ================= */
// // exports.getAdminPendingTasks = async (req, res) => {
// //   try {
// //     const tasks = await Task.find({
// //       status: { $in: ["todo", "in-progress"] }
// //     })
// //       .populate("assignedTo", "name email")
// //       .populate("project", "name")
// //       .sort({ dueDate: 1 })
// //       .limit(20);

// //     res.json(tasks);
// //   } catch (err) {
// //     console.error("Pending task error:", err);
// //     res.status(500).json({ message: "Failed to load pending tasks" });
// //   }
// // };

const User = require("../models/User");
const Team = require("../models/Team");
const Task = require("../models/Task");
// const Project = require("../models/Project"); // जर प्रोजेक्ट मॉडेल वापरत असाल तर अनकमेंट करा

/* ================= ADMIN STATS ================= */
exports.getAdminStats = async (req, res) => {
  try {
    const [
      users,
      teams,
      totalTasks,
      completedTasks,
      pendingTasks
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Task.countDocuments(), // सर्व टास्क
      Task.countDocuments({ status: "completed" }), // पूर्ण झालेले
      Task.countDocuments({ status: "pending" })    // बाकी असलेले
    ]);

    res.json({
      users,
      teams,
      totalTasks,
      completedTasks,
      pendingTasks,
      // जर प्रोजेक्ट्स हवे असतील तर खालील अनकमेंट करा:
      // projects: await Project.countDocuments(),
    });
  } catch (err) {
    res.status(500).json({ message: "Admin dashboard error" });
  }
};

/* ================= EMPLOYEE STATS ================= */
exports.employeeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // नवीन लॉजिक: assignedTo हा Array असल्याने $in किंवा थेट ID मॅच करा
    const [totalTasks, pending, completed] = await Promise.all([
      Task.countDocuments({ assignedTo: { $in: [userId] } }),
      Task.countDocuments({ assignedTo: { $in: [userId] }, status: "pending" }),
      Task.countDocuments({ assignedTo: { $in: [userId] }, status: "completed" })
    ]);

    res.json({
      totalTasks,
      pending,      // 'todo' आणि 'in-progress' ऐवजी आता फक्त 'pending'
      completed
    });
  } catch (err) {
    res.status(500).json({ message: "Employee dashboard error" });
  }
};

/* ================= ADMIN PENDING TASKS (Master List) ================= */
exports.getAdminPendingTasks = async (req, res) => {
  try {
    // ॲडमिनला सर्व 'pending' टास्क दिसतील
    const tasks = await Task.find({ status: "pending" })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 }) // डेडलाईन जवळ असलेले आधी
      .limit(20);

    res.json(tasks);
  } catch (err) {
    console.error("Pending task error:", err);
    res.status(500).json({ message: "Failed to load pending tasks" });
  }
};/* ================= EMPLOYEE PENDING TASKS ================= */
exports.employeePendingTasks = async (req, res) => {
  try {
    const userId = req.user.id;

    // फक्त 'pending' स्टेटस असलेले आणि या युजरला असाइन केलेले टास्क शोधा
    const tasks = await Task.find({
      assignedTo: { $in: [userId] }, // ✅ Array मध्ये शोधण्यासाठी $in वापरा
      status: "pending"              // ✅ नवीन मॉडेलमधील 'pending' स्टेटस
    })
    // .populate("project", "name")     // प्रोजेक्टचे नाव मिळवा
    .sort({ dueDate: 1 });           // जवळची डेडलाईन असलेले टास्क आधी

    res.json({
      count: tasks.length,
      tasks
    });
  } catch (err) {
    console.error("Employee Pending Tasks Error:", err);
    res.status(500).json({ message: "Failed to load pending tasks" });
  }
};