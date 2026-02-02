import { useEffect, useMemo, useState } from "react";
import { fetchEmployeeDashboard, fetchEmployeePendingTasks } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp, Sparkles, Layout,
  BarChart,
  DollarSign,
  RefreshCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getInquiries } from "../services/inquiryService"; // ✅ Inquiry सर्विस इंपोर्ट करा
import { FiTarget, FiMessageCircle, FiActivity, FiCalendar } from "react-icons/fi";
/* ===== RECHARTS ===== */
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  Bar
} from "recharts";
import { getMyPayments } from "../services/paymentCollectionService";
import { getSelfTaskStatus } from "../services/selfTaskService";
import MorningPlanModal from "../components/MorningPlanModal";

export default function EmployeeDashboard() {
const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [inquiries, setInquiries] = useState([]); // ✅ Inquiry स्टेट
  const [paymentFilter, setPaymentFilter] = useState("weekly"); // 'weekly' or 'monthly'
const [mustPlan, setMustPlan] = useState(false);  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // ✅ SUNDAY 12 AM RESET LOGIC (Priority #1)
  // This calculates the collection specifically from the most recent Sunday
  const weeklyCollectionAmount = useMemo(() => {
    const now = dayjs();
    const sundayReset = now.startOf("week"); // Default is Sunday 00:00

    return payments
      .filter(p => dayjs(p.collectionDate).isAfter(sundayReset) || dayjs(p.collectionDate).isSame(sundayReset))
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [payments]);
  useEffect(() => {
        // १. आधी SelfTask स्टेटस चेक करा
    getSelfTaskStatus().then(res => {
      if (!res.data.hasPlan) {
        setMustPlan(true); // जर प्लॅन नसेल तर मोडल दाखवा
      }
    });
    // Fetch both task stats and payment data
    Promise.all([
      fetchEmployeeDashboard(),
      getMyPayments(),
      getInquiries()
]).then(([dashboardRes, paymentRes, inquiryRes]) => {
        setStats(dashboardRes.data);
      setPayments(paymentRes.data);
      setInquiries(inquiryRes.data);
    });
  }, []);

  if (!stats) return <DashboardSkeleton />;

  // Logic to filter payments based on Weekly/Monthly
  const getFilteredPayments = () => {
    const now = dayjs();
    const startOfRange = paymentFilter === "weekly" ? now.startOf("week") : now.startOf("month");
    
    return payments.filter(p => 
      dayjs(p.collectionDate).isAfter(startOfRange) || dayjs(p.collectionDate).isSame(startOfRange)
    );
  };
// --- Inquiry गणना (Calculations) ---
  const todayFollowUps = inquiries.filter(i => 
    i.nextFollowUpDate && dayjs(i.nextFollowUpDate).isSame(dayjs(), 'day')
  ).length;

  const totalInquiries = inquiries.length;
  const convertedLeads = inquiries.filter(i => i.status === "Converted").length;
  const filteredPayments = getFilteredPayments();
  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.paidAmount, 0);

  if (!stats) return <DashboardSkeleton />;

  const statItems = [
    { label: "Total Tasks", value: stats.totalTasks, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "To-Do", value: stats.todo, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Working", value: stats.inProgress, icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Done", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

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
            
            {/* ✅ PRIORITY #1: SUNDAY RESET COLLECTION DISPLAY */}
            <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-[2rem] inline-block">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Weekly Collection (Since Sun 12 AM)</p>
              <p className="text-3xl md:text-5xl font-black text-emerald-400 tracking-tighter">
                ₹{weeklyCollectionAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
             <button onClick={() => navigate("/my-task")} className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                <Layout size={18} /> Open Workspace
             </button>
             <div className="flex gap-3">
                <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Task Efficiency</p>
                   <p className="text-xl font-black text-white">{Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%</p>
                </div>
                <div className="flex-1 bg-white/5 p-4 rounded-2xl text-center border border-white/5">
                   <p className="text-[8px] font-black text-slate-500 uppercase">Rank</p>
                   <p className="text-xl font-black text-white">Top 5</p>
                </div>
             </div>
          </div>
          

          {/* Efficiency Gauge Card */}
          <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white shadow-xl flex items-center gap-6">
             <div className="text-center">
                <p className="text-4xl font-black text-indigo-600">{Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Efficiency</p>
             </div>
             <div className="h-12 w-px bg-slate-200" />
             <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
               <TrendingUp size={24} />
             </div>
          </div>
        </div>
      </div>
{/* ================= TODAY'S FOCUS SECTION ================= */}
<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
  <div className="flex items-center gap-5">
    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
      <Zap size={28} fill="currentColor" />
    </div>
    <div>
      <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Priority Focus</p>
      <h2 className="text-xl font-black text-slate-800">
        {stats.upcomingDeadlines?.[0]?.title || "Finish your pending logs!"}
      </h2>
      <p className="text-slate-500 text-xs font-medium mt-1">
        {stats.upcomingDeadlines?.[0] 
          ? `Deadline: ${dayjs(stats.upcomingDeadlines[0].dueDate).format("hh:mm A today")}`
          : "Great job! No urgent deadlines for the next few hours."}
      </p>
    </div>
  </div>
  
  {stats.upcomingDeadlines?.[0] && (
    <button 
      onClick={() => navigate(`/tasks/${stats.upcomingDeadlines[0]._id}`)}
      className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95"
    >
      Start Now
    </button>
  )}
</div>
{/* ================= MY SALES & INQUIRY PIPELINE ================= */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  
  {/* Card 1: Today's Follow-ups */}
  <div className={`p-6 rounded-[2rem] border transition-all ${todayFollowUps > 0 ? 'bg-amber-50 border-amber-100 animate-pulse' : 'bg-white border-slate-100'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100">
        <FiCalendar size={20} />
      </div>
      <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Action Needed</span>
    </div>
    <h2 className="text-3xl font-black text-slate-900">{todayFollowUps}</h2>
    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Today's Follow-ups</p>
    <button 
      onClick={() => navigate("/my-inquiries")}
      className="mt-4 text-[10px] font-black text-amber-600 uppercase hover:underline"
    >
      View Scheduled Calls →
    </button>
  </div>

  {/* Card 2: Total Active Leads */}
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-indigo-600 text-white rounded-2xl">
        <FiMessageCircle size={20} />
      </div>
      <span className="text-[10px] font-black uppercase text-slate-400">Total Leads</span>
    </div>
    <h2 className="text-3xl font-black text-slate-900">{totalInquiries}</h2>
    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Active Pipeline</p>
  </div>

  {/* Card 3: Conversion Success */}
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-emerald-100 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-emerald-500 text-white rounded-2xl">
        <FiTarget size={20} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-emerald-600 uppercase">Win Rate</p>
        <p className="text-xs font-black text-slate-900">{Math.round((convertedLeads / (totalInquiries || 1)) * 100)}%</p>
      </div>
    </div>
    <h2 className="text-3xl font-black text-slate-900">{convertedLeads}</h2>
    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Converted Deals</p>
  </div>

</div>
{/* ================= PAYMENT COLLECTION SECTION ================= */}
<div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-indigo-100/20">
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
        <DollarSign size={20} />
      </div>
      <div>
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">My Collections</h3>
        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Financial Performance</p>
      </div>
    </div>
    
    {/* Weekly/Monthly Filter Toggle */}
    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit self-center md:self-auto">
      <button 
        onClick={() => setPaymentFilter("weekly")}
        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          paymentFilter === "weekly" 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-400 hover:text-slate-600"
        }`}
      >
        Weekly
      </button>
      <button 
        onClick={() => setPaymentFilter("monthly")}
        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          paymentFilter === "monthly" 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-400 hover:text-slate-600"
        }`}
      >
        Monthly
      </button>
    </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    {/* Summary Stats Side */}
    <div className="lg:col-span-4 space-y-4">
      <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 blur-2xl group-hover:bg-indigo-500/40 transition-all" />
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Received Amount</p>
        <h2 className="text-4xl font-black mt-2 tracking-tight">
          ₹{totalCollected.toLocaleString('en-IN')}
        </h2>
        <div className="mt-6 flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[8px] font-black">
                {filteredPayments[i]?.clientName?.charAt(0) || '+'}
              </div>
            ))}
          </div>
          <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
            {filteredPayments.length} Payments this {paymentFilter === 'weekly' ? 'week' : 'month'}
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => navigate("/payments/my")}
        className="w-full group flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
      >
        View Full Ledger
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>

    {/* Bar Chart Visualization */}
    <div className="lg:col-span-8 h-[220px] bg-slate-50/50 rounded-[2rem] p-4 border border-slate-50">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredPayments.slice(-6)}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="clientName" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}}
            dy={10}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            cursor={{fill: '#f1f5f9', radius: 12}}
            contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px'}}
            formatter={(value) => [`₹${value.toLocaleString()}`, 'Collected']}
          />
          <Bar 
            dataKey="amount" 
            fill="url(#barGradient)" 
            radius={[10, 10, 10, 10]} 
            barSize={32} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-12 gap-6">
        {/* Weekly Flow Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Performance Flow</h3>
             <Zap size={18} className="text-amber-400" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <AreaChart data={stats.weeklyProgress || [{day: "M", value: 4}, {day: "T", value: 7}, {day: "W", value: 5}, {day: "T", value: 9}]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{stroke: '#6366f1', strokeWidth: 2}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution (Donut) */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
           <h3 className="font-black text-slate-800 self-start mb-6 text-xs uppercase tracking-widest">Focus Areas</h3>
           <div className="h-[200px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={8} stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
           </div>
           <div className="flex gap-4 mt-4">
             {pieData.map(item => (
               <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                 <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} /> {item.name}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* ================= LOWER GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PendingTasks navigate={navigate} />
        </div>
        <div className="lg:col-span-5">
           <DeadlineSidebar navigate={navigate} tasks={stats.upcomingDeadlines} />
        </div>
      </div>
    </div>
  );
}

/* ================= REFACTORED SUB-COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`p-3 rounded-xl ${bg} ${color} w-fit mb-4 transition-transform group-hover:scale-110`}>
        <Icon size={20} />
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{value}</h2>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{label}</p>
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
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Active Tasks</h3>
        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">{data.count} TOTAL</span>
      </div>
      <div className="space-y-3">
        {data.tasks.slice(0, 4).map(task => (
          <div 
            key={task._id} 
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <p className="font-bold text-slate-700 text-sm">{task.title}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DeadlineSidebar({ tasks, navigate }) {
  return (
    <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white h-full">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="text-rose-400" size={22} />
        <h3 className="font-black uppercase tracking-widest text-xs">Critical Deadlines</h3>
      </div>
      <div className="space-y-4">
        {tasks?.length > 0 ? tasks.map(task => (
          <div 
            key={task._id} 
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <p className="font-bold text-sm group-hover:text-rose-400 transition-colors">{task.title}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">
               {dayjs(task.dueDate).format("DD MMM")} • <span className="text-rose-400">Action Required</span>
            </p>
          </div>
        )) : (
          <div className="text-center py-10 text-slate-500">
            <p className="text-xs font-bold uppercase tracking-widest italic">All clear for now! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
        <div className="h-64 bg-slate-100 rounded-[2.5rem]" />
      </div>
    </div>
  );
}