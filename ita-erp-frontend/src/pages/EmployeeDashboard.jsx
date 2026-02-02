import { useEffect, useMemo, useState } from "react";
import { fetchEmployeeDashboard, fetchEmployeePendingTasks } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp, Sparkles, Layout,
  BarChart, DollarSign, RefreshCcw, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getInquiries } from "../services/inquiryService"; 
import { FiTarget, FiMessageCircle, FiActivity, FiCalendar } from "react-icons/fi";
import { SiGooglecalendar } from "react-icons/si"; // ✅ Icon for Google Calendar
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  Bar, BarChart as ReBarChart
} from "recharts";
import { getMyPayments } from "../services/paymentCollectionService";
import { getSelfTaskStatus } from "../services/selfTaskService";
import MorningPlanModal from "../components/MorningPlanModal";
import { fetchGoogleEvents } from "../services/authService"; // ✅ Google Service

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [inquiries, setInquiries] = useState([]); 
  const [googleEvents, setGoogleEvents] = useState([]); // ✅ Google State
  const [paymentFilter, setPaymentFilter] = useState("weekly"); 
  const [mustPlan, setMustPlan] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ SUNDAY 12 AM RESET LOGIC
  const weeklyCollectionAmount = useMemo(() => {
    const now = dayjs();
    const sundayReset = now.startOf("week"); 
    return payments
      .filter(p => dayjs(p.collectionDate).isAfter(sundayReset) || dayjs(p.collectionDate).isSame(sundayReset))
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [payments]);

  useEffect(() => {
    // 1. Morning Plan Check
    getSelfTaskStatus().then(res => {
      if (!res.data.hasPlan) setMustPlan(true);
    });

    // 2. Fetch All Data including Google Calendar
    Promise.all([
      fetchEmployeeDashboard(),
      getMyPayments(),
      getInquiries(),
      // ✅ Only fetch if the user logged in via Google
      user.provider === "google" ? fetchGoogleEvents() : Promise.resolve({ data: [] })
    ]).then(([dashboardRes, paymentRes, inquiryRes, googleRes]) => {
      setStats(dashboardRes.data);
      setPayments(paymentRes.data);
      setInquiries(inquiryRes.data);
      setGoogleEvents(googleRes.data || []); // ✅ Set Google Meetings
    }).catch(err => console.error("Sync Error:", err));
  }, []);

  if (!stats) return <DashboardSkeleton />;

  // --- Calculations ---
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {mustPlan && <MorningPlanModal onSuccess={() => setMustPlan(false)} />}

      {/* ================= HERO SECTION ================= */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -mr-20 -mt-20 rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-500/30">
              <RefreshCcw size={12} className="animate-spin-slow" /> Active Shift Ledger
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight italic">
              Hello, <span className="text-indigo-400">{user?.name?.split(" ")[0]}!</span>
            </h1>
            <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-[2rem] inline-block">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Weekly Collection (Since Sun)</p>
              <p className="text-3xl md:text-5xl font-black text-emerald-400 tracking-tighter">
                ₹{weeklyCollectionAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button onClick={() => navigate("/my-task")} className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                <Layout size={18} /> Open Workspace
             </button>
             <div className="flex gap-3 text-white">
                <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Efficiency</p>
                   <p className="text-xl font-black">{Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%</p>
                </div>
                <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Rank</p>
                   <p className="text-xl font-black">Top 5</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= GOOGLE CALENDAR WIDGET (LEFT COL) ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-blue-500/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <SiGooglecalendar size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Calendar</h3>
                  <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Google Live Sync</p>
                </div>
              </div>
              <RefreshCcw size={14} className="text-slate-200 animate-spin-slow" />
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {user.provider === "google" ? (
                googleEvents.length > 0 ? googleEvents.map(event => (
                  <div key={event.id} className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-slate-700 text-xs leading-tight">{event.summary}</p>
                      <a href={event.htmlLink} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-600 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={10} className="text-blue-500" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {dayjs(event.start.dateTime || event.start.date).format("DD MMM • hh:mm A")}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-slate-400 font-black text-[10px] uppercase italic">No upcoming meetings</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                   <SiGooglecalendar size={30} className="mx-auto text-slate-200 mb-3" />
                   <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest leading-relaxed px-4">
                     Please login via Google to sync your calendar meetings here.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT (RIGHT COL) ================= */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Inquiry Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatMiniCard label="Follow-ups" value={todayFollowUps} icon={FiCalendar} color="amber" onClick={() => navigate("/my-inquiries")} />
             <StatMiniCard label="Total Leads" value={totalInquiries} icon={FiMessageCircle} color="indigo" />
             <StatMiniCard label="Win Rate" value={`${Math.round((convertedLeads / (totalInquiries || 1)) * 100)}%`} icon={FiTarget} color="emerald" />
          </div>

          {/* Charts & Pending Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[320px]">
               <h3 className="font-black text-slate-800 self-start mb-6 text-[10px] uppercase tracking-widest">Focus Areas</h3>
               <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                     <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={8} stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="flex gap-4 mt-4">
                 {pieData.map(item => (
                   <div key={item.name} className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
                   </div>
                 ))}
               </div>
            </div>

            <PendingTasks navigate={navigate} />
          </div>

          {/* Priority Focus Alert */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2.5rem] p-6 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Zap size={24} /></div>
                <div>
                   <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Priority Deadline</p>
                   <h4 className="text-sm font-black text-slate-800 mt-0.5">
                     {stats.upcomingDeadlines?.[0]?.title || "All daily logs cleared!"}
                   </h4>
                </div>
             </div>
             {stats.upcomingDeadlines?.[0] && (
               <button onClick={() => navigate(`/tasks/${stats.upcomingDeadlines[0]._id}`)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest">Start</button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS & SUB-COMPONENTS ================= */

function StatMiniCard({ label, value, icon: Icon, color, onClick }) {
  const colors = {
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };
  return (
    <div onClick={onClick} className={`p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md cursor-pointer bg-white group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}><Icon size={18} /></div>
        <TrendingUp size={14} className="text-slate-200" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tight">{label}</p>
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
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
      <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-6">Active Workspace</h3>
      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
        {data.tasks.slice(0, 5).map(task => (
          <div key={task._id} onClick={() => navigate(`/tasks/${task._id}`)} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-indigo-50 transition-all cursor-pointer">
            <p className="font-bold text-slate-700 text-xs truncate max-w-[80%]">{task.title}</p>
            <ChevronRight size={12} className="text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-64 bg-slate-100 rounded-[3rem]" />
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 h-[500px] bg-slate-100 rounded-[2.5rem]" />
        <div className="col-span-8 h-[500px] bg-slate-100 rounded-[2.5rem]" />
      </div>
    </div>
  );
}