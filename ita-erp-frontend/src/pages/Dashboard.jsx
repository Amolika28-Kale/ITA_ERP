import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats, fetchPendingTasks } from "../services/dashboardService";
import { fetchRecentActivity } from "../services/activityService";
import {
  Users, Layers, FolderKanban, Activity, Calendar, 
  ArrowUpRight, ChevronRight, Filter, TrendingUp,
  Clock
} from "lucide-react";
import { getInquiries } from "../services/inquiryService"; // ✅ Inquiry सर्विस इंपोर्ट करा
import { FiTarget, FiMessageCircle, FiTrendingUp } from "react-icons/fi"; // आयकॉन्ससाठी

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

import { format, isToday, isThisWeek } from "date-fns";
import { getAllPayments } from "../services/paymentCollectionService";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
const [pendingTasks, setPendingTasks] = useState([]);
const [payments, setPayments] = useState([]); // Add this state
const [paymentFilter, setPaymentFilter] = useState("week"); // 'week' or 'month'
const [inquiries, setInquiries] = useState([]); // ✅ Inquiry स्टेट
  const [inquiryFilter, setInquiryFilter] = useState("week"); // 'day', 'week', 'month'

  // ✅ 1. Logic to calculate Sunday 12 AM Reset Collection
  const weeklyCollectionPriority = useMemo(() => {
    const now = new Date();
    // Get the most recent Sunday at 12:00:00 AM
    const sundayReset = new Date(now);
    sundayReset.setDate(now.getDate() - now.getDay());
    sundayReset.setHours(0, 0, 0, 0);

    // Filter payments from this Sunday onwards
    const thisWeeksPayments = payments.filter(p => {
      const collectionDate = new Date(p.collectionDate);
      return collectionDate >= sundayReset;
    });

    // Sum the paidAmount
    return thisWeeksPayments.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [payments]);
useEffect(() => {
  if (user.role !== "employee") {
    Promise.all([
      fetchDashboardStats(),
      fetchRecentActivity(),
      fetchPendingTasks(),
      getAllPayments(), // Add this
      getInquiries() // ✅ नवीन API कॉल ॲड करा
    ])
.then(([statsRes, actRes, pendingRes, paymentRes, inquiryRes]) => {
          setStats(statsRes.data);
        setActivity(actRes.data);
        setPendingTasks(pendingRes.data);
        setPayments(paymentRes.data); // Add this
        setInquiries(inquiryRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }
}, []);


  if (user.role === "employee") return <EmployeeWelcome />;
  if (loading) return <DashboardSkeleton />;

  const filteredActivity = activity.filter((a) => {
    if (filter === "today") return isToday(new Date(a.createdAt));
    if (filter === "week") return isThisWeek(new Date(a.createdAt));
    return true;
  });

  const weeklyData = [
    { day: "Mon", tasks: 8 }, { day: "Tue", tasks: 12 }, { day: "Wed", tasks: 6 },
    { day: "Thu", tasks: 15 }, { day: "Fri", tasks: 10 }, { day: "Sat", tasks: 4 }, { day: "Sun", tasks: 2 }
  ];

  const pieData = [
    { name: "Completed", value: 68, color: "#6366f1" },
    { name: "Pending", value: 21, color: "#94a3b8" },
    { name: "Overdue", value: 11, color: "#f43f5e" }
  ];
// --- Inquiry फिल्टरिंग लॉजिक ---
  const filteredInquiryStats = Object.values(
    inquiries.reduce((acc, curr) => {
      const date = new Date(curr.createdAt);
      let isMatch = false;

      if (inquiryFilter === "day") isMatch = isToday(date);
      else if (inquiryFilter === "week") isMatch = isThisWeek(date);
      else if (inquiryFilter === "month") isMatch = date.getMonth() === new Date().getMonth();

      if (isMatch) {
        const empId = curr.employee?._id || "unknown";
        if (!acc[empId]) {
          acc[empId] = {
            name: curr.employee?.name || "Unknown",
            total: 0,
            converted: 0,
            pending: 0
          };
        }
        acc[empId].total += 1;
        if (curr.status === "Converted") acc[empId].converted += 1;
        if (curr.status === "New" || curr.status === "Follow-up") acc[empId].pending += 1;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 mt-1">Real-time insights and team performance metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm w-fit">
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-md">Export Report</button>
        </div>
      </div>
{/* ✅ PRIORITY #1 SECTION: WEEKLY COLLECTION RESET */}
      <div className="grid grid-cols-1 gap-6">
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
                <Clock size={12} className="animate-pulse" /> Weekly Priority Reset: Sunday 12:00 AM
              </div>
              <h2 className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] pt-2">Total Collections This Week</h2>
              <p className="text-white text-6xl md:text-7xl font-black italic tracking-tighter">
                ₹{weeklyCollectionPriority.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="flex gap-4">
               <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md text-center min-w-[140px]">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Target Pace</p>
                  <p className="text-white text-2xl font-black">On Track</p>
               </div>
               <button 
                onClick={() => navigate('/admin/payments')}
                className="bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white p-6 rounded-3xl transition-all group shadow-xl shadow-indigo-500/20"
               >
                 <ArrowUpRight size={32} className="group-hover:rotate-45 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID (Secondary Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Users" value={stats.users} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Operational Teams" value={stats.teams} icon={Layers} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Project Load" value={stats.projects} icon={FolderKanban} color="text-purple-600" bg="bg-purple-50" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate || 0}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>
      {/* ================= INQUIRY PERFORMANCE OVERVIEW (ADMIN) ================= */}
<div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-100/20 p-8 space-y-6">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
        <FiTarget className="text-indigo-600" />
        Inquiry Leaderboard
      </h3>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Employee-wise conversion tracking</p>
    </div>

    {/* Time Filter Toggle */}
    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
      {["day", "week", "month"].map((t) => (
        <button
          key={t}
          onClick={() => setInquiryFilter(t)}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            inquiryFilter === t ? "bg-white text-indigo-600 shadow-md" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    {filteredInquiryStats.length > 0 ? filteredInquiryStats.map((data, index) => (
      <div key={index} className="group bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg shadow-inner">
            {data.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-slate-800 tracking-tight">{data.name}</h4>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{data.total} Total Leads</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Conversion Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
              <span className="text-slate-400 italic">Conversion Rate</span>
              <span className="text-emerald-600">{Math.round((data.converted / data.total) * 100) || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${(data.converted / data.total) * 100 || 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
               <p className="text-[9px] font-black text-emerald-600 uppercase">Won</p>
               <p className="text-lg font-black text-emerald-700 leading-none mt-1">{data.converted}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
               <p className="text-[9px] font-black text-amber-600 uppercase">Follow-up</p>
               <p className="text-lg font-black text-amber-700 leading-none mt-1">{data.pending}</p>
            </div>
          </div>
        </div>
      </div>
    )) : (
      <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed">
        <FiMessageCircle size={40} className="mx-auto text-slate-200 mb-2" />
        <p className="text-slate-400 font-bold text-sm uppercase">No inquiries found for this period</p>
      </div>
    )}
  </div>
</div>
{/* ================= PAYMENT COLLECTION OVERVIEW (ADMIN) ================= */}
<div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
        <TrendingUp size={20} className="text-emerald-600" />
        Payment Collection Leaderboard
      </h3>
      <p className="text-xs text-slate-500 font-medium">Tracking performance based on {paymentFilter}ly targets.</p>
    </div>

    {/* Filter Toggle */}
    <div className="flex bg-slate-100 p-1 rounded-xl">
      <button 
        onClick={() => setPaymentFilter("week")}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentFilter === "week" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
      >
        This Week
      </button>
      <button 
        onClick={() => setPaymentFilter("month")}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${paymentFilter === "month" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
      >
        This Month
      </button>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {Object.values(
   payments.reduce((acc, p) => {
  const date = new Date(p.collectionDate);
         const isMatch = paymentFilter === "week" ? isThisWeek(date) : (date.getMonth() === new Date().getMonth());


  if (isMatch) {
    const empId = p.employee?._id || "unknown";

    if (!acc[empId]) {
      acc[empId] = {
        name: p.employee?.name || "Unknown",
        total: 0,
        count: 0,
      };
    }

    const collectedAmount =
      p.isPartPayment ? p.paidAmount : p.amount;

    acc[empId].total += collectedAmount;
    acc[empId].count += 1;
  }

  return acc;
}, {})

    )
    .sort((a, b) => b.total - a.total) // Show top collector first
    .map((data, index) => (
      <div key={index} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-200 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            {data.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-none">{data.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{data.count} Collections</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Submitted</p>
          <p className="text-xl font-black text-emerald-600 mt-1">₹{data.total.toLocaleString('en-IN')}</p>
        </div>
      </div>
    ))}
  </div>
</div>
 {/* ================= EMPLOYEE PENDING OVERVIEW ================= */}
<div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
    <Users size={18} className="text-indigo-600" />
    Employee Pending Tasks Overview
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Object.values(
      pendingTasks.reduce((acc, task) => {
        // Since assignedTo is now an array, we loop through each assigned user
        if (Array.isArray(task.assignedTo)) {
          task.assignedTo.forEach((employee) => {
            if (!employee || !employee.name) return;

            const empId = employee._id;

            if (!acc[empId]) {
              acc[empId] = {
                employee: employee,
                tasks: []
              };
            }
            // Add the task to this specific employee's list
            acc[empId].tasks.push(task);
          });
        }
        return acc;
      }, {})
    ).map(({ employee, tasks }) => (
      <div key={employee._id} className="border rounded-2xl p-4 hover:shadow-md transition">
        {/* EMPLOYEE HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
              {employee.name ? employee.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{employee.name}</p>
              <p className="text-xs text-slate-500">
                {tasks.length} Pending Task{tasks.length > 1 && "s"}
              </p>
            </div>
          </div>
        </div>

        {/* TASK LIST */}
        <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          {tasks.map(task => (
            <li
              key={`${employee._id}-${task._id}`} // Unique key combining emp and task ID
              onClick={() => navigate(`/tasks/${task._id}`)}
              className="text-sm p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 cursor-pointer transition border border-transparent hover:border-indigo-100"
            >
              <p className="font-medium text-slate-700">{task.title}</p>
              {task.dueDate && (
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <Clock size={10} /> Due {format(new Date(task.dueDate), "MMM dd")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</div>


      {/* CHARTS SECTION */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* AREA CHART - Spans 8 cols on XL */}
        <div className="col-span-12 xl:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Workflow Efficiency</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">+12.5% vs last week</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART - Spans 4 cols on XL */}
        <div className="col-span-12 xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Task Distribution</h3>
          <div className="h-[300px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={5}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
               {pieData.map(item => (
                 <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                    <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <CalendarWidget activity={activity} />
        </div>
        
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" /> Recent Activity
            </h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs font-bold bg-white border-none focus:ring-0 cursor-pointer text-slate-600"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
            {filteredActivity.length > 0 ? filteredActivity.map((a) => (
              <div 
                key={a._id} 
                onClick={() => a.entityId && navigate(`/tasks/${a.entityId}`)}
                className="group flex items-start gap-4 p-4 hover:bg-indigo-50/30 transition cursor-pointer"
              >
                <div className="mt-1 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
                  {a.performedBy?.name?.charAt(0) || "S"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900">{a.performedBy?.name || "System"}</span> {a.message}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1 block">
                    {format(new Date(a.createdAt), "MMM dd • hh:mm a")}
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition" />
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400 text-sm">No activity found</div>
            )}
          </div>
        </div>
      </div>

      {/* ================= PENDING TASKS ================= */}
<div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
  <div className="p-6 border-b bg-slate-50">
    <h3 className="font-bold text-slate-800 flex items-center gap-2">
      <Clock className="text-amber-500" size={18} />
      Employee Pending Tasks
    </h3>
  </div>

  <div className="divide-y max-h-[400px] overflow-y-auto">
    {pendingTasks.length ? pendingTasks.map(task => (
      <div
        key={task._id}
        onClick={() => navigate(`/tasks/${task._id}`)}
        className="p-4 hover:bg-indigo-50/40 cursor-pointer transition"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-slate-800">
              {task.title}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {task.assignedTo?.name} • {task.project?.name}
            </p>
          </div>

          <span
            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase
              ${
                task.status === "todo"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-indigo-100 text-indigo-700"
              }
            `}
          >
            {task.status}
          </span>
        </div>

        {task.dueDate && (
          <p className="text-[10px] text-slate-400 mt-2">
            Due {format(new Date(task.dueDate), "MMM dd")}
          </p>
        )}
      </div>
    )) : (
      <div className="p-8 text-center text-slate-400 text-sm">
        No pending tasks 🎉
      </div>
    )}
  </div>
</div>

    </div>

    
  );
}

/* ================= REFACTORED SUB-COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
      
      <div className="flex items-center gap-3">
        {/* ICON */}
        <div className={`${bg} ${color} w-9 h-9 rounded-xl flex items-center justify-center`}>
          <Icon size={18} />
        </div>

        {/* TEXT */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            {value}
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            {label}
          </p>
        </div>
      </div>

    </div>
  );
}


function CalendarWidget({ activity }) {
  const days = ["S","M","T","W","T","F","S"];
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Calendar size={20} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Deadlines & Milestones</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
     {days.map((d, index) => (
  <div
    key={`${d}-${index}`}   // ✅ UNIQUE KEY
    className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center"
  >
    {d}
  </div>
))}
</div>


      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }).map((_, i) => {
          const hasDeadline = activity.some(a => format(new Date(a.createdAt), "d") === String(i + 1));
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-default
                ${hasDeadline ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" : "text-slate-600 hover:bg-slate-50"}
              `}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmployeeWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <Activity className="w-12 h-12 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-black text-slate-900">Welcome back!</h2>
      <p className="text-slate-500 mt-2 max-w-xs">Your personal dashboard is ready. Focus on your high-priority tasks for today.</p>
      <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">
        View My Tasks
      </button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8 h-80 bg-slate-200 rounded-3xl" />
        <div className="col-span-12 md:col-span-4 h-80 bg-slate-200 rounded-3xl" />
      </div>
    </div>
  );
}