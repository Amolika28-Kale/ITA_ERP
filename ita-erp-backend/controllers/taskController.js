// const Task = require("../models/Task");
// const Project = require("../models/Project");
// const TaskComment = require("../models/TaskComment");
// const { logActivity } = require("../utils/activityLogger");
// const ActivityLog = require("../models/ActivityLog");
// const { sendNotification } = require("../utils/notify");

// /* ================= CREATE TASK ================= */
// exports.createTask = async (req, res) => {
//   try {
//     let {
//       title,
//       description,
//       project,
//       assignedTo,
//       priority,
//       dueDate,
//       parentTask,
//       taskType = "personal"
//     } = req.body;

//     if (!title) {
//       return res.status(400).json({ message: "Title required" });
//     }

//     // 1. प्रोजेक्ट व्हॅलिडेशन
//     if (project) {
//       const projectExists = await Project.findById(project);
//       if (!projectExists) {
//         return res.status(400).json({ message: "Invalid project" });
//       }
//     }

//     // 2. ✅ MULTIPLE ASSIGNMENT LOGIC
//     if (!assignedTo || assignedTo === "self" || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
//       assignedTo = [req.user.id];
//     } else if (!Array.isArray(assignedTo)) {
//       assignedTo = [assignedTo];
//     }

//     // 3. टास्क क्रिएशन
//     const task = await Task.create({
//       title,
//       description,
//       project: project || null,
//       assignedTo, // आता हा Array सेव्ह होईल
//       priority,
//       dueDate,
//       parentTask: parentTask || null,
//       createdBy: req.user.id,
//       taskType
//     });

//     // 4. ✅ NOTIFICATION (Multiple Users साठी)
//     // आता users मध्ये थेट task.assignedTo (जो आधीच Array आहे) पाठवू शकता
//     await sendNotification({
//       users: task.assignedTo, 
//       title: "New Task Assigned",
//       message: `You were assigned "${task.title}"`,
//       type: "task",
//       entityId: task._id
//     });

//     // 5. ✅ LOG ACTIVITY
//     // visibleTo मध्ये स्वतःचा ID आणि असाइन केलेल्या सर्वांचे IDs एकत्र करा
//     const visibleToMembers = [...new Set([req.user.id, ...task.assignedTo])];

//     await logActivity({
//       entityType: "task",
//       entityId: task._id,
//       action: "created",
//       message: `created task "${task.title}"`,
//       userId: req.user.id,
//       visibleTo: visibleToMembers
//     });

//     res.status(201).json(task);
//   } catch (err) {
//     console.error("Backend Error:", err);
//     res.status(500).json({ message: "Failed to create task", error: err.message });
//   }
// };




// /* ================= GET MY TASKS ================= */
// exports.getMyTasks = async (req, res) => {
//   try {
//     // ✅ FIXED: Use $in to check if user ID exists in assignedTo array
//     const tasks = await Task.find({
//       assignedTo: { $in: [req.user.id] }
//     })
//       .populate("assignedTo", "name")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch tasks" });
//   }
// };


// exports.getTaskDetails = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate("assignedTo", "name")
//       .populate("project", "name")
//       .populate("parentTask", "title");

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const subtasks = await Task.find({ parentTask: task._id })
//       .populate("assignedTo", "name");

//     const comments = await TaskComment.find({ task: task._id })
//       .populate("user", "name")
//       .sort({ createdAt: 1 });

//     res.json({ task, subtasks, comments });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load task" });
//   }
// };


// /* ================= GET TASKS BY PROJECT ================= */
// exports.getTasksByProject = async (req, res) => {
//   try {
//     const tasks = await Task.find(req.taskFilter)
//       .populate("assignedTo", "name")
//       .populate("createdBy", "name")
//       .populate("parentTask", "title");

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch tasks" });
//   }
// };
// // Employee: Get today's tasks (not completed today)
// exports.getTodayTasks = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0,0,0,0);

//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     const tasks = await Task.find({
//       assignedTo: req.user.id,
//       dueDate: {
//         $gte: today,
//         $lt: tomorrow
//       },
//       completedDates: {
//         $ne: today
//       }
//     }).select("title dueDate");

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load daily tasks" });
//   }
// };


// exports.getAdminDailyTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({
//       isDaily: true,
//       dueDate: {
//         $gte: new Date().setHours(0,0,0,0)
//       }
//     })
//     .populate("assignedTo", "name")
//     .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load daily tasks" });
//   }
// };

// /* ================= MARK TASK DONE TODAY (For Daily Tasks) ================= */
// exports.markTaskDoneToday = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     // ✅ FIXED: Check if user is in assignedTo array
//     const isAssigned = task.assignedTo.some(id => id.toString() === req.user.id);
//     if (!isAssigned) return res.status(403).json({ message: "Not allowed" });

//     const today = new Date();
//     today.setHours(0,0,0,0);

//     if (!task.completedDates.some(d => new Date(d).getTime() === today.getTime())) {
//       task.completedDates.push(today);
//       await task.save();
//     }

//     res.json({ message: "Task completed for today" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update task" });
//   }
// };


// /* ================= UPDATE TASK ================= */
// exports.updateTask = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     await sendNotification({
//       users: [task.createdBy, task.assignedTo].filter(Boolean),
//       title: "Task Updated",
//       message: `"${task.title}" was updated`,
//       type: "task",
//       entityType: "task",
//       entityId: task._id
//     });

// await logActivity({
//   entityType: "task",
//   entityId: task._id,
//   action: "updated",
//   message: `updated task "${task.title}"`,
//   userId: req.user.id,
//   visibleTo: [
//     task.createdBy,
//     task.assignedTo,
//   ].filter(Boolean),
// });


//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update task" });
//   }
// };

// /* ================= DELETE TASK ================= */
// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     await Task.deleteOne({ _id: task._id });

// await logActivity({
//   entityType: "task",
//   entityId: task._id,
//   action: "deleted",
//   message: `deleted task "${task.title}"`,
//   userId: req.user.id,
//   visibleTo: [
//     task.createdBy,
//     task.assignedTo,
//   ].filter(Boolean),
// });


//     res.json({ message: "Task deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete task" });
//   }
// };

// /* ================= UPDATE TASK STATUS ================= */
// exports.updateTaskStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const allowed = ["todo", "in-progress", "review", "completed"];
    
//     if (!allowed.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     // ✅ 1. PERMISSION LOGIC (Array & Subtask Support)
//     const isAssignedDirectly = task.assignedTo.some(id => id.toString() === req.user.id);
//     const isCreator = task.createdBy?.toString() === req.user.id;
    
//     let isAssignedViaParent = false;
//     if (task.parentTask) {
//       const parent = await Task.findById(task.parentTask);
//       isAssignedViaParent = parent?.assignedTo.some(id => id.toString() === req.user.id);
//     }

//     // Admin/Manager ला अडवू नका, फक्त Employee साठी चेक लावा
//     if (req.user.role === "employee" && !isAssignedDirectly && !isCreator && !isAssignedViaParent) {
//       return res.status(403).json({ message: "Not allowed to update this task status" });
//     }

//     // ✅ 2. UPDATE STATUS
//     task.status = status;
//     await task.save();

//     // ✅ 3. NOTIFICATION LIST (Unique Users)
//     // Task शी संबंधित सर्व लोकांची लिस्ट (Creator + All Assignees)
//     const allRelatedUsers = [
//       task.createdBy?.toString(),
//       ...task.assignedTo.map(id => id.toString())
//     ].filter(Boolean);

//     // स्वतःला सोडून इतरांना नोटिफिकेशन पाठवा
//     const notifyUsers = [...new Set(allRelatedUsers)].filter(id => id !== req.user.id);

//     await sendNotification({
//       users: notifyUsers,
//       title: "Task Status Updated",
//       message: `"${task.title}" moved to ${status}`,
//       type: "task",
//       entityType: "task",
//       entityId: task._id
//     });

//     // ✅ 4. LOG ACTIVITY
//     await logActivity({
//       entityType: task.parentTask ? "subtask" : "task",
//       entityId: task._id,
//       action: "status",
//       message: `changed status to "${status}"`,
//       userId: req.user.id,
//       projectId: task.project || null,
//       visibleTo: [...new Set(allRelatedUsers)]
//     });

//     res.json(task);
//   } catch (err) {
//     console.error("Update Status Error:", err);
//     res.status(500).json({ message: "Failed to update status" });
//   }
// };


// /* ================= ADD COMMENT ================= */
// exports.addComment = async (req, res) => {
//   try {
//     if (!req.body.message?.trim()) {
//       return res.status(400).json({ message: "Comment required" });
//     }

//     const task = await Task.findById(req.params.taskId);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const comment = await TaskComment.create({
//       task: task._id,
//       user: req.user.id,
//       message: req.body.message
//     });

//     const notifyUsers = [task.createdBy, task.assignedTo]
//       .filter(Boolean)
//       .filter(id => id.toString() !== req.user.id);

//     // ✅ FIXED
//     await sendNotification({
//       users: notifyUsers,
//       title: "New Comment",
//       message: `New comment on "${task.title}"`,
//       type: "task",
//       entityType: "task",
//       entityId: task._id
//     });

//     await logActivity({
//       entityType: "comment",
//       entityId: comment._id,
//       action: "comment",
//       message: "added a comment",
//       userId: req.user.id,
//       visibleTo: [task.createdBy, task.assignedTo].filter(Boolean),
//     });

//     res.status(201).json(comment);
//   } catch (err) {
//     console.error("Add comment error:", err);
//     res.status(500).json({ message: "Failed to add comment" });
//   }
// };


// /* ================= GET COMMENTS ================= */
// exports.getComments = async (req, res) => {
//   try {
//     const comments = await TaskComment.find({
//       task: req.params.taskId
//     }).populate("user", "name");

//     res.json(comments);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch comments" });
//   }
// };

// // ================= UPDATE COMMENT ================= */
// exports.updateComment = async (req, res) => {
//   try {
//     const comment = await TaskComment.findById(req.params.commentId);
//     if (!comment) return res.status(404).json({ message: "Comment not found" });

//     if (comment.user.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not allowed" });
//     }

//     comment.message = req.body.message;
//     await comment.save();

//     const task = await Task.findById(comment.task);

//     await logActivity({
//       entityType: "comment",
//       entityId: comment._id,
//       action: "comment-edit",
//       message: "edited a comment",
//       userId: req.user.id,
//       visibleTo: [task.createdBy, task.assignedTo].filter(Boolean)
//     });

//     res.json(comment);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update comment" });
//   }
// };

// /* ================= CREATE SUBTASK ================= */
// exports.createSubTask = async (req, res) => {
//   try {
//     const { title, description, assignedTo, priority, dueDate } = req.body;
//     const { parentTaskId } = req.params;

//     if (!title) {
//       return res.status(400).json({ message: "Title required" });
//     }

//     const parentTask = await Task.findById(parentTaskId);
//     if (!parentTask) {
//       return res.status(404).json({ message: "Parent task not found" });
//     }

//     const subtask = await Task.create({
//       title,
//       description,
//       project: parentTask.project,
//       parentTask: parentTaskId,
//       assignedTo,
//       priority,
//       dueDate,
//       createdBy: req.user.id
//     });

//     await sendNotification({
//   user: parentTask.assignedTo,
//   title: "New Subtask Created",
//   message: `Subtask "${subtask.title}" added`,
//   type: "task",
//   entityType: "subtask",
//   entityId: subtask._id
// });


// await logActivity({
//   entityType: "subtask",
//   entityId: subtask._id,
//   action: "created",
//   message: `created subtask "${subtask.title}"`,
//   userId: req.user.id,
//   projectId: parentTask.project,
//   visibleTo: [
//     parentTask.createdBy,
//     parentTask.assignedTo,
//     subtask.assignedTo,
//   ].filter(Boolean),
// });


//     res.status(201).json(subtask);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create subtask" });
//   }
// };

// /* ================= GET SUBTASKS ================= */
// exports.getSubTasks = async (req, res) => {
//   try {
//     const subtasks = await Task.find({
//       parentTask: req.params.parentTaskId
//     })
//       .populate("assignedTo", "name")
//       .sort({ createdAt: 1 });

//     res.json(subtasks);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch subtasks" });
//   }
// };


// // ================= GET TASK ACTIVITY ================= */
// exports.getTaskActivity = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.taskId);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const logs = await ActivityLog.find({
//       visibleTo: req.user.id
//     })
//       .populate("performedBy", "name")
//       .sort({ createdAt: -1 });

//     res.json(logs);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load task activity" });
//   }
// };

const Task = require("../models/Task");
const { sendNotification } = require("../utils/notify");

/**
 * 1. Create Task (Individual Assignment Logic)
 * Creates a SEPARATE task record for each assigned user.
 */
exports.createTask = async (req, res) => {
try {
    const { title, description, assignedTo, priority, dueDate, isRecurring, frequency } = req.body;
    const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    const taskPromises = assignees.map(userId => {
      return Task.create({
        title,
        description,
        assignedTo: [userId],
        priority,
        dueDate,
        isRecurring, // Added
        frequency,   // Added
        createdBy: req.user.id,
        taskType: frequency === "daily" ? "daily" : "normal"
      });
    });

    const createdTasks = await Promise.all(taskPromises);

    // 🔔 Notify each user individually
    await Promise.all(createdTasks.map(task => 
      sendNotification({
        users: task.assignedTo,
        title: "New Task Assigned 🚀",
        message: `You have been assigned a new task: "${title}"`,
        type: "task",
        entityType: "task",
        entityId: task._id,
        sendEmail: true
      })
    ));

    res.status(201).json({ message: "Tasks assigned individually", count: createdTasks.length });
  } catch (err) {
    console.error("Creation Error:", err);
    res.status(500).json({ message: "Failed to create individual tasks" });
  }
};
// ✅ ADMIN: UPDATE/EDIT ANY TASK
exports.updateTask = async (req, res) => {
  try {
    // Only Admin/Manager can edit the core details of a task
    if (req.user.role === "employee") {
      return res.status(403).json({ message: "Employees can only toggle status, not edit details" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Updates title, description, priority, etc.
      { new: true }
    ).populate("assignedTo", "name");

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
// 2. Get Employee's Tasks
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: { $in: [req.user.id] } })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

/**
 * 2. Toggle Status (Checkbox Logic)
 * Toggles status between pending/completed and notifies the Admin upon completion.
 */
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Toggle logic
    task.status = task.status === "completed" ? "pending" : "completed";
    await task.save();

    // 🔔 Notify the Creator/Admin when a task is completed
    if (task.status === "completed") {
      await sendNotification({
        users: [task.createdBy], 
        title: "Task Completed ✅",
        message: `${req.user.name} has completed the task: "${task.title}"`,
        type: "task",
        entityType: "task",
        entityId: task._id,
        sendEmail: true
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 4. Get Task Details
exports.getTaskDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Load failed" });
  }
};

// controllers/taskController.js
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all tasks" });
  }
};


/* ================= EMPLOYEE: GET TODAY'S DAILY TASKS ================= */
// कर्मचाऱ्याला आजचे जे 'Daily' टास्क पूर्ण करायचे आहेत ते मिळवण्यासाठी
exports.getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await Task.find({
      assignedTo: { $in: [req.user.id] }, // ✅ Array चेक
      taskType: "daily",                  // ✅ फक्त डेली टास्क
      dueDate: {
        $gte: today,
        $lt: tomorrow
      },
      completedDates: {
        $ne: today // आज अजून पूर्ण केलेला नाही
      }
    }).select("title dueDate priority");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load daily tasks" });
  }
};

/* ================= ADMIN: VIEW ALL DAILY TASKS ================= */
// ॲडमिनला आजचे सर्व डेली टास्क ट्रॅक करण्यासाठी
exports.getAdminDailyTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      taskType: "daily",
      dueDate: { $gte: today }
    })
    .populate("assignedTo", "name")
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to load daily tasks" });
  }
};

/* ================= MARK TASK DONE TODAY ================= */
// डेली टास्कसाठी दररोजची एन्ट्री 'completedDates' मध्ये सेव्ह करण्यासाठी
exports.markTaskDoneToday = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ परवानगी तपासा: युजर assignedTo Array मध्ये आहे का?
    const isAssigned = task.assignedTo.some(id => id.toString() === req.user.id);
    if (!isAssigned) return res.status(403).json({ message: "Not allowed" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // जर आजची तारीख आधीच नसेल, तरच ॲड करा
    const alreadyDone = task.completedDates.some(d => 
      new Date(d).getTime() === today.getTime()
    );

    if (!alreadyDone) {
      task.completedDates.push(today);
      await task.save();
    }

    res.json({ message: "Task completed for today successfully!" });
  } catch (err) {
    console.error("Mark Done Error:", err);
    res.status(500).json({ message: "Failed to update daily task" });
  }
};
/**
 * 3. Update Task Status (Explicit Selection)
 * Updates status and notifies all stakeholders (Creator + All Assignees).
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "completed"];
    
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status selection" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Permission Check
    const isAssignedDirectly = task.assignedTo.some(id => id.toString() === req.user.id);
    const isCreator = task.createdBy?.toString() === req.user.id;
    
    if (req.user.role === "employee" && !isAssignedDirectly && !isCreator) {
      return res.status(403).json({ message: "Access denied" });
    }

    task.status = status;
    await task.save();

    // 🔔 Notify all related stakeholders except the one who made the change
    const allRelatedUsers = [...new Set([
      task.createdBy?.toString(),
      ...task.assignedTo.map(id => id.toString())
    ])].filter(id => id !== req.user.id);

    await sendNotification({
      users: allRelatedUsers,
      title: `Status Update: ${status.toUpperCase()}`,
      message: `The task "${task.title}" is now marked as ${status}.`,
      type: "task",
      entityType: "task",
      entityId: task._id,
      sendEmail: true
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task status" });
  }
};

// ================= EMPLOYEE: CREATE OWN TASK =================
exports.createSelfTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo: [req.user.id], // 👈 self assigned
      createdBy: req.user.id,    // 👈 self created
      priority,
      dueDate,
      taskType: "normal",
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Self Task Error:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
};
