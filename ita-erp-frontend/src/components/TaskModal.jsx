import { useEffect, useState } from "react";
import { createTask, updateTask } from "../services/taskService";
import { fetchUsers } from "../services/userService";
import TaskComments from "./TaskComments";
import SubTasks from "./SubTasks";

export default function TaskModal({ projectId, task, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo?._id || "",
    dueDate: task?.dueDate?.substring(0, 10) || "",
  });

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    loadUsers();
  }, []);

  /* ================= HANDLE FORM ================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    if (!projectId) {
      alert("Project context missing");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title,
        description: form.description || "",
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };

      if (task) {
        await updateTask(task._id, payload);
      } else {
        await createTask({
          ...payload,
          project: projectId, // REQUIRED
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Task save failed", err);
      alert("Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg font-bold mb-4">
          {task ? "Edit Task" : "Create Task"}
        </h2>

        {/* TITLE */}
        <input
          name="title"
          placeholder="Task title *"
          value={form.title}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        />

        {/* ASSIGN USER */}
        <select
          name="assignedTo"
          value={form.assignedTo}
          onChange={handleChange}
          className="w-full mb-3 p-2.5 border rounded-lg"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* PRIORITY */}
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

        {/* DUE DATE */}
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full mb-4 p-2.5 border rounded-lg"
        />

        {/* SUBTASKS (Only for existing tasks) */}
        {task && <SubTasks task={task} />}

        {/* COMMENTS (Only for existing tasks) */}
        {task && <TaskComments taskId={task._id} />}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
