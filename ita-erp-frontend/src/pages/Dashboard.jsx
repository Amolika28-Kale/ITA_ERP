import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../services/dashboardService";
import { fetchRecentActivity } from "../services/activityService";
import {
  Users,
  Layers,
  FolderKanban,
  Activity,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { format, isToday, isThisWeek } from "date-fns";

/* ================= DASHBOARD ================= */

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== "employee") {
      Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity()
      ]).then(([statsRes, actRes]) => {
        setStats(statsRes.data);
        setActivity(actRes.data);
        setLoading(false);
      });
    }
  }, []);

  if (user.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Activity className="w-14 h-14 text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-slate-500">Check your assigned tasks</p>
      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;

  /* ================= FILTERED ACTIVITY ================= */

  const filteredActivity = activity.filter((a) => {
    if (filter === "today") return isToday(new Date(a.createdAt));
    if (filter === "week") return isThisWeek(new Date(a.createdAt));
    return true;
  });

  /* ================= CHART DATA ================= */

  const weeklyData = [
    { day: "Mon", tasks: 8 },
    { day: "Tue", tasks: 12 },
    { day: "Wed", tasks: 6 },
    { day: "Thu", tasks: 15 },
    { day: "Fri", tasks: 10 },
    { day: "Sat", tasks: 4 },
    { day: "Sun", tasks: 2 }
  ];

  const pieData = [
    { name: "Completed", value: 68, color: "#22c55e" },
    { name: "Pending", value: 21, color: "#f59e0b" },
    { name: "Overdue", value: 11, color: "#ef4444" }
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm">
          Monitor tasks, deadlines and team activity
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat label="Users" value={stats.users} icon={Users} />
        <Stat label="Teams" value={stats.teams} icon={Layers} />
        <Stat label="Projects" value={stats.projects} icon={FolderKanban} />
        <Stat label="Active Projects" value={stats.activeProjects} icon={Activity} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* AREA CHART */}
        <div className="bg-white p-6 rounded-2xl border">
          <h3 className="font-bold mb-4">Weekly Task Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="tasks"
                stroke="#6366f1"
                fill="#c7d2fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl border">
          <h3 className="font-bold mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60}>
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">

        {/* CALENDAR */}
        <CalendarWidget activity={activity} />

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Activity</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto">
            {filteredActivity.map((a) => (
              <div
                key={a._id}
                onClick={() => a.entityId && navigate(`/tasks/${a.entityId}`)}
                className="cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <p className="text-sm">
                  <b>{a.performedBy?.name || "System"}</b> {a.message}
                </p>
                <span className="text-xs text-slate-400">
                  {format(new Date(a.createdAt), "dd MMM, hh:mm a")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border">
      <Icon className="text-indigo-600 mb-3" />
      <h2 className="text-3xl font-black">{value}</h2>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function CalendarWidget({ activity }) {
  return (
    <div className="bg-white p-6 rounded-2xl border">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-indigo-600" />
        <h3 className="font-bold">Deadlines Calendar</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["S","M","T","W","T","F","S"].map(d => (
          <div key={d} className="text-slate-400">{d}</div>
        ))}

        {Array.from({ length: 30 }).map((_, i) => {
          const hasDeadline = activity.some(
            a => format(new Date(a.createdAt), "d") === String(i + 1)
          );

          return (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                hasDeadline
                  ? "bg-indigo-600 text-white font-bold"
                  : "hover:bg-slate-100"
              }`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-40 bg-slate-200 rounded" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
