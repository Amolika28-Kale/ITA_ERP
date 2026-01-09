import { useEffect, useState } from "react";
import {
  fetchSubTasks,
  createSubTask
} from "../services/taskService";

export default function SubTasks({ task }) {
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const res = await fetchSubTasks(task._id);
    setSubtasks(res.data);
  };

  useEffect(() => {
    load();
  }, [task._id]);

  const add = async () => {
    if (!title.trim()) return;

    await createSubTask(task._id, { title });
    setTitle("");
    load();
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-3">Subtasks</h3>

      <div className="space-y-2">
        {subtasks.length === 0 && (
          <p className="text-sm text-gray-400">No subtasks</p>
        )}

        {subtasks.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
          >
            <span className="text-sm">{s.title}</span>
            <span className="text-xs text-gray-500 capitalize">
              {s.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New subtask"
          className="flex-1 border p-2 rounded-lg"
        />
        <button
          onClick={add}
          className="bg-indigo-600 text-white px-3 rounded-lg"
        >
          Add
        </button>
      </div>
    </div>
  );
}
