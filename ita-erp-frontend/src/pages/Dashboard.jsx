import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../services/dashboardService";
import { Users, Layers, FolderKanban, Activity, ArrowUpRight, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== "employee") {
      fetchDashboardStats()
        .then((res) => setStats(res.data))
        .finally(() => setLoading(false));
    }
  }, []);

  if (user.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-indigo-50 p-6 rounded-full mb-4">
          <Activity className="text-indigo-600 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back!</h2>
        <p className="text-slate-500">Check your personal tasks in the 'My Tasks' section.</p>
      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+5%" },
    { label: "Departments", value: stats.teams, icon: Layers, color: "text-purple-600", bg: "bg-purple-50", trend: "Stable" },
    { label: "Total Projects", value: stats.projects, icon: FolderKanban, color: "text-amber-600", bg: "bg-amber-50", trend: "+12%" },
    { label: "Active Now", value: stats.activeProjects, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-slate-500 text-sm">Here's what's happening across your organization today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div 
            key={card.label} 
            className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon size={24} />
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                card.trend.includes('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {card.trend.includes('+') && <ArrowUpRight size={10} />}
                {card.trend}
              </span>
            </div>
            
            <div className="mt-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {card.value.toLocaleString()}
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Row - Visual Placeholder for Graphs/Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 min-h-[300px] flex items-center justify-center text-slate-300 italic">
          <div className="text-center">
             <TrendingUp size={48} className="mx-auto mb-2 opacity-20" />
             <p>Analytics Graph Placeholder</p>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
          <h3 className="font-bold text-lg mb-4 relative z-10">Quick Actions</h3>
          <div className="space-y-3 relative z-10">
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors text-left">Create New Project</button>
            <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors text-left">Invite Team Member</button>
            <button className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm transition-colors text-center font-bold">Generate Report</button>
          </div>
          {/* Abstract background shape */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

/* Skeleton Loader for smooth UX */
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}