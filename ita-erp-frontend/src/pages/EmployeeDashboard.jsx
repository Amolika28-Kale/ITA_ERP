import { useEffect, useState } from "react";
import { fetchEmployeeDashboard } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

/* ===== RECHARTS ===== */
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

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
    { label: "Pending", value: stats.todo, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Active", value: stats.inProgress, icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const pieData = [
    { name: "Pending", value: stats.todo, color: "#f59e0b" },
    { name: "In Progress", value: stats.inProgress, color: "#6366f1" },
    { name: "Completed", value: stats.completed, color: "#10b981" },
  ];

  const productivityData = stats.weeklyProgress || [
    { day: "Mon", value: 2 }, { day: "Tue", value: 3 }, { day: "Wed", value: 1 },
    { day: "Thu", value: 4 }, { day: "Fri", value: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:p-8 space-y-8 md:space-y-12">

      {/* ================= HERO SECTION ================= */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 text-white shadow-2xl shadow-indigo-200/50">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
              Daily Digest
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Keep it up, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-400 mt-4 text-sm md:text-lg max-w-md leading-relaxed">
              You've completed <span className="text-white font-bold">{stats.completed}</span> tasks this week. 
              Only <span className="text-indigo-400 font-bold">{stats.inProgress}</span> tasks left to hit your goal.
            </p>
            <button
              onClick={() => navigate("/my-tasks")}
              className="mt-8 flex items-center justify-center gap-2 w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Start Working <ChevronRight size={18} />
            </button>
          </div>

          {/* Productivity Visual */}
          <div className="hidden lg:flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <div className="text-center">
               <p className="text-3xl font-black">{Math.round((stats.completed / stats.totalTasks) * 100)}%</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase">Efficiency</p>
            </div>
            <div className="h-12 w-[1px] bg-white/10" />
            <TrendingUp size={40} className="text-indigo-400" />
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-600/10 blur-[80px] rounded-full" />
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT: Charts */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart Card */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm flex flex-col items-center">
               <h3 className="font-black text-slate-800 self-start mb-4">Task Mix</h3>
               <div className="h-[200px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={8} stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                  </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="flex gap-4 mt-2">
                 {pieData.map(item => (
                   <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
                   </div>
                 ))}
               </div>
            </div>

            {/* Weekly Line Card */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm">
               <h3 className="font-black text-slate-800 mb-4">Weekly Flow</h3>
               <div className="h-[200px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{stroke: '#6366f1', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Priority Quick-Link */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 p-6 rounded-[2rem] text-white flex items-center justify-between group cursor-pointer shadow-lg shadow-amber-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"><Zap size={24} fill="white" /></div>
              <div>
                <h4 className="font-bold">Next Priority Task</h4>
                <p className="text-white/80 text-sm">Finish the API documentation for Version 2.0</p>
              </div>
            </div>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* RIGHT: Deadlines */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm h-full overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><CalendarDays size={20} /></div>
              <h3 className="font-black text-slate-800">Deadlines</h3>
            </div>

            <div className="space-y-4">
              {stats.upcomingDeadlines?.length > 0 ? stats.upcomingDeadlines.map(task => (
                <div 
                  key={task._id} 
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer border border-transparent hover:border-indigo-100"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{task.title}</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                      Due {dayjs(task.dueDate).format("MMM DD")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                    Late
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">🎉</div>
                  <p className="text-slate-400 text-xs font-bold uppercase">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= REFACTORED STAT CARD ================= */

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 md:p-7 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`p-3 md:p-4 rounded-2xl ${bg} ${color} w-fit mb-4 md:mb-6`}>
        <Icon size={22} className="md:size-26" />
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-slate-800">{value}</h2>
      <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-pulse">
      <div className="h-64 bg-slate-200 rounded-[3rem]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-200 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}