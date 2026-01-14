import { useEffect, useState, useMemo } from "react";
import { fetchEmployeeDashboard, fetchEmployeePendingTasks } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp, Sparkles
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
    { label: "Total Tasks", value: stats.totalTasks, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50/50" },
    { label: "To-Do", value: stats.todo, icon: Clock, color: "text-amber-600", bg: "bg-amber-50/50" },
    { label: "In Progress", value: stats.inProgress, icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-50/50" },
    { label: "Done", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50/50" },
  ];

  const pieData = [
    { name: "To-Do", value: stats.todo, color: "#f59e0b" },
    { name: "Working", value: stats.inProgress, color: "#6366f1" },
    { name: "Done", value: stats.completed, color: "#10b981" },
  ];

  return (
    <div 
    className=" space-y-6 md:space-y-10 bg-[#fbfcfd]"
    >

      {/* ================= LIGHT MESH HERO SECTION ================= */}
      <div className="relative overflow-hidden bg-white border border-indigo-100 rounded-[2.5rem] p-8 md:p-14 shadow-xl shadow-indigo-100/20">
        {/* Decorative Mesh Gradient Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 blur-[100px] -mr-40 -mt-40 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 blur-[100px] -ml-20 -mb-20 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100/50">
              <Sparkles size={14} /> Productivity Sync
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">{user?.name?.split(" ")[0]}!</span>
            </h1>
            <p className="text-slate-500 mt-6 text-sm md:text-lg max-w-lg leading-relaxed font-medium">
              You've completed <span className="text-emerald-600 font-extrabold">{stats.completed}</span> tasks. 
              Only <span className="text-indigo-600 font-extrabold">{stats.inProgress}</span> more to hit your weekly milestone.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => navigate("/my-tasks")}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-200 active:scale-95"
              >
                Go to My Tasks
              </button>
            </div>
          </div>

          {/* Glass Card Visual */}
          <div className="w-full md:w-auto flex items-center gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-sm">
             <div className="text-center">
                <p className="text-4xl font-black text-indigo-600">{Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Efficiency</p>
             </div>
             <div className="h-16 w-[1px] bg-slate-100" />
             <div className="p-4 bg-indigo-50 rounded-2xl">
               <TrendingUp size={32} className="text-indigo-500" />
             </div>
          </div>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {statItems.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        
        {/* LEFT: Task Mix & Weekly Flow */}
        <div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
               <h3 className="font-black text-slate-800 self-start mb-6 text-sm uppercase tracking-widest">Task Distribution</h3>
               <div className="h-[220px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={85} paddingAngle={10} stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="flex flex-wrap justify-center gap-4 mt-4">
                 {pieData.map(item => (
                   <div key={item.name} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                     <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
                   </div>
                 ))}
               </div>
            </div>

            {/* Area Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Weekly Workflow</h3>
               <div className="h-[220px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={stats.weeklyProgress || [{day: "M", value: 1}, {day: "T", value: 2}]}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                    <Tooltip cursor={{stroke: '#6366f1', strokeWidth: 2}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>
          </div>

          <PendingTasks />
        </div>

        {/* RIGHT: Deadlines */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl"><CalendarDays size={20} /></div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Critical</h3>
              </div>
              <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-3 py-1 rounded-full">DEADLINES</span>
            </div>

            <div className="space-y-4">
              {stats.upcomingDeadlines?.length > 0 ? stats.upcomingDeadlines.map(task => (
                <div 
                  key={task._id} 
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="group flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer border border-transparent hover:border-indigo-100"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">
                      Due {dayjs(task.dueDate).format("MMM DD")}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                </div>
              )) : (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-slate-200">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No late tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT: STAT CARD ================= */

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
      <div className={`p-4 rounded-2xl ${bg} ${color} w-fit mb-6 transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">{value}</h2>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] mt-2">{label}</p>
    </div>
  );
}

/* ================= COMPONENT: PENDING TASKS ================= */

function PendingTasks() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchEmployeePendingTasks().then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
          Pending Tasks ({data.count})
        </h3>
        <button className="text-[10px] font-black text-indigo-600 hover:underline">VIEW ALL</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.tasks.map(task => (
          <div key={task._id} className="p-5 bg-[#f8fafc] rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
            <p className="font-bold text-slate-800 text-sm">{task.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {task.project?.name || "Unassigned"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-pulse">
      <div className="h-80 bg-slate-100 rounded-[3rem]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}