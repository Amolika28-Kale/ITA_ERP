import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getTaskDetails,
  updateTaskStatus,
  addTaskComment
} from "../services/taskService";

export default function TaskDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const load = async () => {
    const res = await getTaskDetails(id);
    setData(res.data);
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
      <h1 className="text-2xl font-bold">{task.title}</h1>

      <p className="text-gray-500">{task.description}</p>

      {/* STATUS */}
      <div className="flex gap-2">
        {["todo", "in-progress", "review", "completed"].map(s => (
          <button
            key={s}
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

      {/* SUBTASKS */}
      <div>
        <h2 className="font-semibold mb-2">Subtasks</h2>
        {subtasks.map(st => (
          <div key={st._id} className="p-3 bg-white rounded shadow mb-2">
            {st.title}
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div>
        <h2 className="font-semibold mb-2">Comments</h2>

        {comments.map(c => (
          <div key={c._id} className="mb-2 text-sm">
            <b>{c.user.name}:</b> {c.message}
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
    </div>
  );
}
