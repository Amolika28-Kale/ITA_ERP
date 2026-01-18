import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDailyTasks() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "self",
    dueDate: today,
  });

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      
      /**
       * FIX: Ensure we are extracting an array.
       * If res.data is the array, use it. 
       * If your backend wraps it (e.g., { users: [] }), use res.data.users.
       */
      const rawData = res.data;
      const extractedUsers = Array.isArray(rawData) 
        ? rawData 
        : (rawData.users || []);

      setUsers(extractedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]); // Fallback to empty array to prevent .map errors
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/tasks", {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        dueDate: form.dueDate,
        priority: "medium",
        project: "DAILY_TASK",
        isDaily: true
      });

      alert("✅ Daily task assigned successfully");

      setForm({
        title: "",
        description: "",
        assignedTo: "self",
        dueDate: today
      });
    } catch (err) {
      alert("❌ Failed to assign daily task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          📅 Admin Daily Tasks
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Assign daily work to staff or yourself
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-5"
      >
        {/* TITLE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Task Title *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Check attendance entries"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border border-slate-300 rounded-xl px-4 py-2 min-h-[90px] focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Optional task details"
          />
        </div>

        {/* ASSIGN TO */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assign To
          </label>
          <select
            value={form.assignedTo}
            onChange={(e) =>
              setForm({ ...form, assignedTo: e.target.value })
            }
            className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="self">👤 Assign to myself</option>
            
            {/* SAFE MAPPING: Only runs if users is an array */}
            {Array.isArray(users) && users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name || u.email || "Unknown User"}
              </option>
            ))}
          </select>
        </div>

        {/* DATE */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
            className="border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition"
        >
          {loading ? "Assigning..." : "Assign Daily Task"}
        </button>
      </form>
    </div>
  );
}