import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getTaskDetails,
  updateTaskStatus,
  addTaskComment,
  updateTaskComment,
  fetchTaskActivity
} from "../services/taskService";

export default function TaskDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [activity, setActivity] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const isEmployee = user.role === "employee";

  const load = async () => {
    const res = await getTaskDetails(id);
    setData(res.data);

    const act = await fetchTaskActivity(id);
    setActivity(act.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!data) return null;

  const { task, subtasks, comments } = data;

  const changeStatus = async (status) => {
    await updateTaskStatus(task._id, status);
    load();
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    await addTaskComment(task._id, comment);
    setComment("");
    load();
  };

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <h1 className="text-2xl font-bold">{task.title}</h1>

      <p className="text-gray-500">{task.description}</p>

      <p className="text-sm">
        Priority: <b>{task.priority}</b>
      </p>

      {/* STATUS */}
      <div className="flex gap-2">
        {["todo", "in-progress", "review", "completed"].map(s => (
          <button
            key={s}
            disabled={isEmployee && task.assignedTo?._id !== user.id}
            onClick={() => changeStatus(s)}
            className={`px-3 py-1 rounded text-sm
              ${task.status === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-200"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* SUBTASKS WITH CHECKBOX */}
      <div>
        <h2 className="font-semibold mb-2">Subtasks</h2>

        {subtasks.map(st => (
          <div
            key={st._id}
            className="flex items-center gap-2 p-2 bg-white rounded shadow mb-2"
          >
            <input
              type="checkbox"
              checked={st.status === "completed"}
              onChange={async () => {
                await updateTaskStatus(
                  st._id,
                  st.status === "completed" ? "todo" : "completed"
                );
                load();
              }}
            />
            <span className={st.status === "completed" ? "line-through" : ""}>
              {st.title}
            </span>
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div>
        <h2 className="font-semibold mb-2">Comments</h2>

        {comments.map(c => (
          <div key={c._id} className="mb-2 text-sm">
            <b>{c.user?.name || "System"}:</b>

            {editingId === c._id ? (
              <>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="border rounded w-full p-1 mt-1"
                />
                <button
                  onClick={async () => {
                    await updateTaskComment(c._id, editText);
                    setEditingId(null);
                    load();
                  }}
                  className="text-xs text-blue-600"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span> {c.message}</span>
                {c.user?._id === user.id && (
                  <button
                    onClick={() => {
                      setEditingId(c._id);
                      setEditText(c.message);
                    }}
                    className="ml-2 text-xs text-gray-500"
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded p-2 mt-2"
          placeholder="Add comment"
        />

        <button
          onClick={submitComment}
          className="mt-2 bg-black text-white px-4 py-2 rounded"
        >
          Add Comment
        </button>
      </div>

      {/* ACTIVITY TIMELINE */}
      <div>
        <h2 className="font-semibold mb-2">Activity</h2>

        {activity.map(a => (
          <div key={a._id} className="text-sm text-gray-600">
            <b>{a.userId?.name || "System"}</b> {a.message}
            <span className="ml-2 text-xs text-gray-400">
              {new Date(a.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
