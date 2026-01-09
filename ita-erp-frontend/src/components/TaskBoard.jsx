import { useEffect, useState } from "react";
import {
  fetchTasksByProject,
  createTask,
  updateTaskStatus
} from "../services/taskService";
import { fetchUsers } from "../services/userService";
import Modal from "./Modal";

const COLUMNS = ["todo", "in-progress", "review", "completed"];

export default function Tasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  });

  useEffect(() => {
    load();
  }, [projectId]);

  const load = async () => {
    const [tRes, uRes] = await Promise.all([
      fetchTasksByProject(projectId),
      fetchUsers()
    ]);
    setTasks(tRes.data);
    setUsers(uRes.data);
  };

  const submit = async () => {
    if (!form.title) return;

    await createTask({
      ...form,
      project: projectId
    });

    setShowModal(false);
    load();
  };

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">

      {COLUMNS.map((col) => (
        <div key={col} className="bg-gray-50 rounded-xl p-3">
          <h3 className="font-bold capitalize mb-3">{col}</h3>

          {tasks
            .filter((t) => t.status === col)
            .map((t) => (
              <div
                key={t._id}
                className="bg-white p-3 rounded-lg shadow mb-3 cursor-pointer"
                onClick={() =>
                  updateTaskStatus(
                    t._id,
                    COLUMNS[(COLUMNS.indexOf(col) + 1) % 4]
                  ).then(load)
                }
              >
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-gray-400">
                  {t.assignedTo?.name || "Unassigned"}
                </p>
              </div>
            ))}
        </div>
      ))}

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg"
      >
        + New Task
      </button>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Task">
        <input
          className="w-full border p-3 rounded mb-3"
          placeholder="Task title"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <select
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        >
          <option value="">Assign user</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>

        <button
          onClick={submit}
          className="w-full bg-indigo-600 text-white py-3 rounded font-bold"
        >
          Create Task
        </button>
      </Modal>
    </div>
  );
}
