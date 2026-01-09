import { useEffect, useState } from "react";
import {
  fetchTaskComments,
  addTaskComment
} from "../services/taskService";

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    const res = await fetchTaskComments(taskId);
    setComments(res.data);
  };

  useEffect(() => {
    if (taskId) loadComments();
  }, [taskId]);

  const submit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    await addTaskComment(taskId, message);
    setMessage("");
    await loadComments();
    setLoading(false);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-3">Discussion</h3>

      <div className="space-y-3 max-h-40 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet</p>
        )}

        {comments.map((c) => (
          <div key={c._id} className="bg-gray-100 p-2 rounded-lg">
            <p className="text-sm font-semibold">{c.user?.name}</p>
            <p className="text-sm">{c.message}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border p-2 rounded-lg"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
