import { useState } from "react";
import {
  createTask,
  updateTask,
} from "../services/taskService";

export default function TaskModal({ projectId, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo?._id || "",
    dueDate: task?.dueDate?.substring(0, 10) || "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      if (task) {
        await updateTask(task._id, form);
      } else {
        await createTask({
          ...form,
          project: projectId,
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Task save failed", err);
      alert("Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          {task ? "Edit Task" : "Create Task"}
        </h2>

        <input
          name="title"
          placeholder="Task title *"
          value={form.title}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full mb-4 p-2.5 border rounded-lg"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
