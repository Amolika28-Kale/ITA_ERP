import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function ActivityLog({ fetcher }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetcher()
      .then((res) => setLogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetcher]);

  return (
    <div className="bg-white rounded-xl border shadow-sm h-full flex flex-col">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Clock size={16} className="text-indigo-500" />
        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet</p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li
                key={log._id}
                className="border-l-2 border-indigo-200 pl-4"
              >
                <p className="text-sm">
                  <span className="font-semibold">
                    {log.performedBy?.name}
                  </span>{" "}
                  {log.message}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
