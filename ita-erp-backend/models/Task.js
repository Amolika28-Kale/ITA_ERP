const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

project: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Project",
  default: null
},


    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed"],
      default: "todo"
    },
    taskType: {
    type: String,
    enum: ["normal", "daily"],
    default: "normal"
  },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },

    dueDate: Date,

    completedDates: [
  {
    type: Date
  }
],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
taskSchema.index({ parentTask: 1 });
