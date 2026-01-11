import { useEffect, useState } from "react";
import { fetchEmployeeDashboard } from "../services/dashboardService";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Briefcase,
  ChevronRight,
  Zap,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/* ===== RECHARTS ===== */
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchEmployeeDashboard().then(res => setStats(res.data));
  }, []);

  if (!stats) return <DashboardSkeleton />;

  /* ===== CARDS ===== */
  const statItems = [
    { label: "Total Tasks", value: stats.totalTasks, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats.todo, icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "In Progress", value: stats.inProgress, icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  /* ===== PIE DATA ===== */
  const pieData = [
    { name: "Pending", value: stats.todo },
    { name: "In Progress", value: stats.inProgress },
    { name: "Completed", value: stats.completed },
  ];

  const pieColors = ["#CBD5E1", "#6366F1", "#10B981"];

  /* ===== LINE DATA (mock or backend-ready) ===== */
  const productivityData = stats.weeklyProgress || [
    { day: "Mon", value: 2 },
    { day: "Tue", value: 3 },
    { day: "Wed", value: 1 },
    { day: "Thu", value: 4 },
    { day: "Fri", value: 2 },
  ];

  /* ===== DEADLINES ===== */
  const deadlines = stats.upcomingDeadlines || [];

  return (
    <div className="max-w-7xl mx-auto space-y-12">

      {/* ================= WELCOME ================= */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl overflow-hidden">
        <h1 className="text-4xl font-black">
          Hello, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-300 mt-3 max-w-lg">
          You have <b className="text-indigo-400">{stats.inProgress}</b> tasks in progress.
          Let’s keep the momentum going.
        </p>

        <button
          onClick={() => navigate("/my-tasks")}
          className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white hover:text-slate-900 px-6 py-4 rounded-2xl font-bold transition"
        >
          View My Tasks
          <ChevronRight />
        </button>

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 blur-[120px] rounded-full" />
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* TASK DISTRIBUTION */}
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="font-black text-lg mb-6">Task Distribution</h3>

          <div className="h-[260px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WEEKLY PRODUCTIVITY */}
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="font-black text-lg mb-6">Weekly Productivity</h3>

          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={productivityData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= DEADLINES ================= */}
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="text-indigo-600" />
          <h3 className="font-black text-lg">Upcoming Deadlines</h3>
        </div>

        {deadlines.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming deadlines 🎉</p>
        ) : (
          <ul className="space-y-4">
            {deadlines.map(task => (
              <li
                key={task._id}
                onClick={() => navigate(`/tasks/${task._id}`)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    Due {dayjs(task.dueDate).format("DD MMM")}
                  </p>
                </div>
                <span className="text-xs font-bold text-rose-500">Deadline</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ================= PRIORITY ================= */}
      <div className="bg-white p-8 rounded-[2.5rem] border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl">
            <Zap fill="currentColor" />
          </div>
          <div>
            <h3 className="font-black">Priority Focus</h3>
            <p className="text-sm text-slate-400">
              Complete high priority tasks first.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border shadow-sm hover:shadow-lg transition">
      <div className={`p-4 rounded-2xl ${bg} ${color} w-fit mb-5`}>
        <Icon size={26} />
      </div>
      <h2 className="text-4xl font-black">{value}</h2>
      <p className="text-sm text-slate-400 font-bold uppercase">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-[3rem]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-slate-200 rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}
