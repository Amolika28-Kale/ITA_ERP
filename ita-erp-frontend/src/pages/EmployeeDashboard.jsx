import { useEffect, useState } from "react";
import { fetchEmployeeDashboard } from "../services/dashboardService";
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  Briefcase, 
  ChevronRight, 
  Zap 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchEmployeeDashboard().then(res => setStats(res.data));
  }, []);

  if (!stats) return <DashboardSkeleton />;

  const statItems = [
    { label: "Total Tasks", value: stats.totalTasks, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: stats.todo, icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "In Progress", value: stats.inProgress, icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      
      {/* --- WELCOME SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 md:p-12 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-indigo-200">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Personal Workspace
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            Hello, {user?.name?.split(' ')[0] || "Team Member"}! 👋
          </h1>
          <p className="text-slate-400 mt-2 max-w-md font-medium">
            You have <span className="text-indigo-400 font-bold">{stats.inProgress} tasks</span> currently in progress. Let's finish them today!
          </p>
        </div>
        
        <button onClick={() => navigate("/my-tasks")}
         className="relative z-10 w-fit group flex items-center gap-3 bg-white/10 hover:bg-white text-white hover:text-slate-900 px-6 py-4 rounded-2xl font-bold transition-all backdrop-blur-md">
          View My Tasks
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Decorative Background Shape */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-[80px]" />
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => (
          <StatCard key={idx} {...item} />
        ))}
      </div>

      {/* --- UPCOMING PRIORITY SECTION (Placeholder) --- */}
      <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">Priority Focus</h3>
               <p className="text-sm text-slate-400">High priority tasks need your attention.</p>
            </div>
         </div>
         <span className="hidden sm:block text-xs font-black text-slate-300 uppercase tracking-widest">
           Automated Sync
         </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="h-1 w-10 bg-slate-100 rounded-full" />
      </div>
      
      <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
        {value}
      </h2>
      <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-48 bg-slate-200 rounded-[3rem]" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200 rounded-[2.5rem]" />)}
      </div>
    </div>
  );
}