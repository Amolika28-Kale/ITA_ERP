import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    API.get("/tasks/my").then(res => setTasks(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Tasks</h1>

      <div className="space-y-3">
        {tasks.map(task => (
          <Link
            key={task._id}
            to={`/tasks/${task._id}`}
            className="block bg-white p-4 rounded shadow hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-500 capitalize">
              Status: {task.status.replace("-", " ")}
            </p>

            {task.project && (
              <p className="text-xs text-gray-400">
                Project: {task.project.name}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
