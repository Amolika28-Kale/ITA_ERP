import { useEffect, useMemo, useState } from "react";
import { fetchEmployeeDashboard, fetchEmployeePendingTasks } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp, RefreshCcw, Layout,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getInquiries } from "../services/inquiryService"; 
import { FiTarget, FiMessageCircle, FiCalendar } from "react-icons/fi";
import { SiGooglecalendar } from "react-icons/si"; 
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";
import { getMyPayments } from "../services/paymentCollectionService";
import { getSelfTaskStatus } from "../services/selfTaskService";
import MorningPlanModal from "../components/MorningPlanModal";
import { fetchGoogleEvents } from "../services/authService";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [inquiries, setInquiries] = useState([]); 
  const [googleEvents, setGoogleEvents] = useState([]); 
  const [mustPlan, setMustPlan] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const weeklyCollectionAmount = useMemo(() => {
    const now = dayjs();
    const sundayReset = now.startOf("week"); 
    return payments
      .filter(p => dayjs(p.collectionDate).isAfter(sundayReset) || dayjs(p.collectionDate).isSame(sundayReset))
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [payments]);

  useEffect(() => {
    getSelfTaskStatus().then(res => {
      if (!res.data.hasPlan) setMustPlan(true);
    });

    Promise.all([
      fetchEmployeeDashboard(),
      getMyPayments(),
      getInquiries(),
      user.provider === "google" ? fetchGoogleEvents() : Promise.resolve({ data: [] })
    ]).then(([dashboardRes, paymentRes, inquiryRes, googleRes]) => {
      setStats(dashboardRes.data);
      setPayments(paymentRes.data);
      setInquiries(inquiryRes.data);
      setGoogleEvents(googleRes.data || []);
    }).catch(err => console.error("Sync Error:", err));
  }, []);

  if (!stats) return <DashboardSkeleton />;

  const todayFollowUps = inquiries.filter(i => 
    i.nextFollowUpDate && dayjs(i.nextFollowUpDate).isSame(dayjs(), 'day')
  ).length;
  const totalInquiries = inquiries.length;
  const convertedLeads = inquiries.filter(i => i.status === "Converted").length;

  const pieData = [
    { name: "To-Do", value: stats.todo, color: "#f59e0b" },
    { name: "Working", value: stats.inProgress, color: "#6366f1" },
    { name: "Done", value: stats.completed, color: "#10b981" },
  ];

  return (
    // P-4 on mobile, P-8 on desktop
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-10 animate-in fade-in duration-700">
      {mustPlan && <MorningPlanModal onSuccess={() => setMustPlan(false)} />}

      {/* ================= HERO SECTION ================= */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-indigo-500/10 blur-[60px] lg:blur-[80px] -mr-10 -mt-10 rounded-full" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 text-center lg:text-left">
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/30">
              <RefreshCcw size={12} className="animate-spin-slow" /> Active Shift Ledger
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight italic">
              Hello, <span className="text-indigo-400">{user?.name?.split(" ")[0]}!</span>
            </h1>
            
            <div className="mt-6 p-5 lg:p-6 bg-white/5 border border-white/10 rounded-[1.5rem] lg:rounded-[2rem] inline-block w-full sm:w-auto">
              <p className="text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1">Weekly Collection</p>
              <p className="text-3xl lg:text-5xl font-black text-emerald-400 tracking-tighter">
                ₹{weeklyCollectionAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button onClick={() => navigate("/my-task")} className="w-full lg:w-auto bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                <Layout size={18} /> Open Workspace
             </button>
             <div className="flex gap-2 lg:gap-3 text-white">
                <div className="flex-1 bg-white/5 p-3 lg:p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Efficiency</p>
                   <p className="text-lg lg:text-xl font-black">{Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%</p>
                </div>
                <div className="flex-1 bg-white/5 p-3 lg:p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Rank</p>
                   <p className="text-lg lg:text-xl font-black">Top 5</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* CALENDAR - Moves to bottom on mobile, stays left on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-6 shadow-xl shadow-blue-500/5 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl">
                  <SiGooglecalendar size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] lg:text-xs">Calendar</h3>
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Live Sync</p>
                </div>
              </div>
              <RefreshCcw size={14} className="text-slate-200 animate-spin-slow" />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {user.provider === "google" ? (
                googleEvents.length > 0 ? googleEvents.map(event => (
                  <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-slate-700 text-xs leading-tight line-clamp-2">{event.summary}</p>
                      <a href={event.htmlLink} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-600">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={10} className="text-blue-500" />
                      <p className="text-[9px] font-black text-slate-400 uppercase">
                        {dayjs(event.start.dateTime || event.start.date).format("DD MMM • hh:mm A")}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-40 text-slate-400 font-black text-[10px] uppercase italic">No upcoming meetings</div>
                )
              ) : (
                <div className="text-center py-8 lg:py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 px-4">
                   <SiGooglecalendar size={24} className="mx-auto text-slate-200 mb-2" />
                   <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest leading-relaxed">Login via Google to sync calendar meetings.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN STATS & CHARTS */}
        <div className="order-1 lg:order-2 lg:col-span-8 space-y-6 lg:space-y-8">
          
          {/* Mini Stats Grid - 1 col on small mobile, 3 on tablet/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
             <StatMiniCard label="Follow-ups" value={todayFollowUps} icon={FiCalendar} color="amber" onClick={() => navigate("/my-inquiries")} />
             <StatMiniCard label="Total Leads" value={totalInquiries} icon={FiMessageCircle} color="indigo" />
             <StatMiniCard label="Win Rate" value={`${Math.round((convertedLeads / (totalInquiries || 1)) * 100)}%`} icon={FiTarget} color="emerald" />
          </div>

          {/* Charts Row - Stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <h3 className="font-black text-slate-800 self-start mb-6 text-[10px] uppercase tracking-widest">Focus Areas</h3>
                <div className="w-full h-[180px] lg:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={8} stroke="none">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
                    </div>
                  ))}
                </div>
            </div>

            <PendingTasks navigate={navigate} />
          </div>

          {/* Alert Bar */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[1.5rem] lg:rounded-[2rem] p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
             <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-white rounded-xl lg:rounded-2xl text-indigo-600 shadow-sm shrink-0"><Zap size={20} /></div>
                <div className="min-w-0">
                   <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Priority Deadline</p>
                   <h4 className="text-xs lg:text-sm font-black text-slate-800 truncate">
                     {stats.upcomingDeadlines?.[0]?.title || "All daily logs cleared!"}
                   </h4>
                </div>
             </div>
             {stats.upcomingDeadlines?.[0] && (
               <button onClick={() => navigate(`/tasks/${stats.upcomingDeadlines[0]._id}`)} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest">Start</button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, icon: Icon, color, onClick }) {
  const colors = {
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };
  return (
    <div onClick={onClick} className="p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border bg-white shadow-sm transition-all active:scale-95 cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl ${colors[color]}`}><Icon size={18} /></div>
        <TrendingUp size={14} className="text-slate-200" />
      </div>
      <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{value}</h2>
      <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase mt-1">{label}</p>
    </div>
  );
}

function PendingTasks({ navigate }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchEmployeePendingTasks().then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-5 lg:p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full">
      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[9px] lg:text-[10px] mb-4 lg:mb-6">Active Workspace</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {data.tasks.slice(0, 5).map(task => (
          <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-white border border-transparent hover:border-indigo-50 transition-all cursor-pointer">
            <p className="font-bold text-slate-700 text-[11px] truncate flex-1 pr-2">{task.title}</p>
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-pulse">
      <div className="h-48 lg:h-64 bg-slate-100 rounded-[2rem] lg:rounded-[3rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-4 h-[300px] lg:h-[500px] bg-slate-100 rounded-[2rem]" />
        <div className="order-1 lg:order-2 lg:col-span-8 h-[400px] lg:h-[500px] bg-slate-100 rounded-[2rem]" />
      </div>
    </div>
  );
}