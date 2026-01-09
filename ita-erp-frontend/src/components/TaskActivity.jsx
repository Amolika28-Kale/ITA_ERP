import { useEffect, useState } from "react";
import { fetchActivityByTask } from "../services/activityService";

export default function TaskActivity({ taskId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!taskId) return;

    fetchActivityByTask(taskId)
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, [taskId]);

  if (!logs.length) {
    return (
      <p className="text-xs text-gray-400 mt-2">
        No activity yet
      </p>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold text-sm mb-3">
        Activity
      </h3>

      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log._id} className="text-sm">
            <span className="font-medium">
              {log.performedBy?.name}
            </span>{" "}
            {log.message}
            <div className="text-xs text-gray-400">
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
