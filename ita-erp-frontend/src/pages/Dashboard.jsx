import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../services/dashboardService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats().then(res => setStats(res.data));
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        ["Users", stats.users],
        ["Teams", stats.teams],
        ["Projects", stats.projects],
        ["Active Projects", stats.activeProjects],
      ].map(([label, value]) => (
        <div key={label} className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-400 text-sm">{label}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
        </div>
      ))}
    </div>
  );
}
