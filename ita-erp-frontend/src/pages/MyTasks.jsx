import { useEffect, useState } from "react";
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
          <div key={task._id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-500">{task.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
