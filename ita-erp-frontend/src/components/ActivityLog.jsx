import { useEffect, useState } from "react";
import { fetchActivityByProject } from "../services/activityService";

export default function ActivityLog({ projectId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    fetchActivityByProject(projectId)
      .then((res) => setLogs(res.data))
      .catch(console.error);
  }, [projectId]);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Activity Log</h3>

      <ul className="space-y-3">
        {logs.map((log) => (
          <li key={log._id} className="text-sm text-gray-700">
            <span className="font-medium">{log.performedBy?.name}</span>{" "}
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
