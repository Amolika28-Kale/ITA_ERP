import { useEffect, useState } from "react";
import { fetchEmployeeDashboard } from "../services/dashboardService";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchEmployeeDashboard().then(res => setStats(res.data));
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <Card label="Total Tasks" value={stats.totalTasks} />
      <Card label="To Do" value={stats.todo} />
      <Card label="In Progress" value={stats.inProgress} />
      <Card label="Completed" value={stats.completed} />
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <p className="text-gray-400 text-sm">{label}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}
