import { useEffect, useMemo, useState } from "react";
import { fetchEmployeeDashboard, fetchEmployeePendingTasks } from "../services/dashboardService";
import {
  CheckCircle2, Clock, PlayCircle, Briefcase, 
  ChevronRight, Zap, CalendarDays, TrendingUp, RefreshCcw, Layout,
  ExternalLink, ListTodo, Edit3, AlertCircle, Award,
  Target, TrendingUp as Trending, Users, DollarSign
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
import toast from "react-hot-toast";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [inquiries, setInquiries] = useState([]); 
  const [googleEvents, setGoogleEvents] = useState([]); 
  const [mustPlan, setMustPlan] = useState(false);
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const weeklyCollectionAmount = useMemo(() => {
    const now = dayjs();
    const weekStart = now.startOf("week"); 
    return payments
      .filter(p => dayjs(p.collectionDate).isAfter(weekStart) || dayjs(p.collectionDate).isSame(weekStart))
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [payments]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load plan status
        const statusRes = await getSelfTaskStatus();
        console.log("Self task status:", statusRes.data);
        
        if (!statusRes.data.hasPlan) {
          setMustPlan(true);
        } else {
          setTodayPlan({
            plannedTasks: statusRes.data.plannedTasks,
            hasPlan: true,
            hasAchievement: statusRes.data.hasAchievement,
            achievements: statusRes.data.achievements
          });
        }

        // Load other data in parallel
        const [dashboardRes, paymentRes, inquiryRes, googleRes] = await Promise.all([
          fetchEmployeeDashboard(),
          getMyPayments(),
          getInquiries(),
          user.provider === "google" ? fetchGoogleEvents() : Promise.resolve({ data: [] })
        ]);

        setStats(dashboardRes.data);
        setPayments(paymentRes.data);
        setInquiries(inquiryRes.data);
        setGoogleEvents(googleRes.data || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user.provider]);

  const handlePlanSuccess = () => {
    setMustPlan(false);
    getSelfTaskStatus().then(res => {
      setTodayPlan({
        plannedTasks: res.data.plannedTasks,
        hasPlan: true,
        hasAchievement: res.data.hasAchievement,
        achievements: res.data.achievements
      });
      toast.success("Today's plan loaded!");
    });
  };

  if (loading) return <DashboardSkeleton />;
  if (!stats) return <DashboardError />;

  const todayFollowUps = inquiries.filter(i => 
    i.nextFollowUpDate && dayjs(i.nextFollowUpDate).isSame(dayjs(), 'day')
  ).length;

  const totalInquiries = inquiries.length;
  const convertedLeads = inquiries.filter(i => i.status === "Converted").length;
  const winRate = totalInquiries > 0 ? Math.round((convertedLeads / totalInquiries) * 100) : 0;

  const pieData = [
    { name: "To-Do", value: stats.todo, color: "#f59e0b" },
    { name: "Working", value: stats.inProgress, color: "#6366f1" },
    { name: "Done", value: stats.completed, color: "#10b981" },
  ];

  // Parse plan text into bullet points
  const parsePlanText = (text) => {
    if (!text) return [];
    return text.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[•\-\d.\s]+/, '').trim());
  };

  const planBullets = parsePlanText(todayPlan?.plannedTasks);
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completed / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {mustPlan && <MorningPlanModal onSuccess={handlePlanSuccess} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 lg:space-y-10">
        
        {/* ================= HERO SECTION ================= */}
        <section aria-label="Welcome section" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 text-center lg:text-left">
            
            {/* Welcome Text */}
            <div className="flex-1 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                <RefreshCcw size={12} className="animate-spin-slow" />
                <span>Active Dashboard</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  {user?.name?.split(' ')[0] || 'Employee'}!
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-indigo-200/80 mt-3 max-w-2xl mx-auto lg:mx-0">
                {dayjs().format('dddd, MMMM D, YYYY')} • {completionRate}% tasks completed
              </p>
            </div>

            {/* Weekly Collection Card */}
            <div className="w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center gap-3 text-indigo-200 mb-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Weekly Collection</span>
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400">
                  ₹{weeklyCollectionAmount.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-300">
                  <Trending size={12} className="text-emerald-400" />
                  <span>+12% from last week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6 lg:mt-8">
            <button 
              onClick={() => navigate("/my-task")} 
              className="group flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-indigo-50 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              <Layout size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Open Workspace</span>
            </button>
            
            <div className="flex gap-3">
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                <p className="text-[8px] font-bold text-indigo-300 uppercase">Efficiency</p>
                <p className="text-lg sm:text-xl font-black text-white">{completionRate}%</p>
              </div>
              <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                <p className="text-[8px] font-bold text-indigo-300 uppercase">Tasks Done</p>
                <p className="text-lg sm:text-xl font-black text-white">{stats.completed}/{stats.totalTasks}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TODAY'S PLAN SECTION ================= */}
        {todayPlan?.plannedTasks && (
          <section aria-label="Today's plan" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                  <ListTodo size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wider">
                    Today's Mission Plan
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {dayjs().format("dddd, DD MMM YYYY")}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setMustPlan(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Edit3 size={14} />
                <span>Edit Plan</span>
              </button>
            </div>

            {planBullets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {planBullets.map((bullet, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 sm:p-4 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md group-hover:scale-110 transition-transform shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed flex-1">
                      {bullet}
                    </p>
                    {todayPlan?.hasAchievement && (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/50 rounded-xl">
                <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No tasks planned for today</p>
              </div>
            )}

            {/* Progress & Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span>{todayPlan?.hasAchievement ? '100%' : '60%'}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: todayPlan?.hasAchievement ? '100%' : '60%' }}
                  />
                </div>
              </div>

              {!todayPlan?.hasAchievement && (
                <button
                  onClick={() => navigate("/my-task")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-200"
                >
                  <CheckCircle2 size={14} />
                  <span>Log Achievements</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* ================= CONTENT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* CALENDAR SECTION */}
          <section aria-label="Calendar" className="order-2 lg:order-1 lg:col-span-4">
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg h-full">
              <header className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <SiGooglecalendar size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                      Calendar
                    </h3>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase">
                      {user.provider === "google" ? 'Live Sync' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                <RefreshCcw size={14} className="text-slate-300 animate-spin-slow" />
              </header>

              <div className="space-y-2 max-h-[350px] sm:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {user.provider === "google" ? (
                  googleEvents.length > 0 ? (
                    googleEvents.slice(0, 5).map(event => (
                      <article key={event.id} className="p-3 sm:p-4 bg-slate-50 hover:bg-white rounded-xl border border-transparent hover:border-blue-100 transition-all group">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-700 line-clamp-2">
                            {event.summary}
                          </p>
                          {event.htmlLink && (
                            <a 
                              href={event.htmlLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-slate-300 hover:text-blue-600 shrink-0"
                              aria-label="Open in Google Calendar"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={10} className="text-blue-500" />
                          <time className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">
                            {dayjs(event.start.dateTime || event.start.date).format("DD MMM • hh:mm A")}
                          </time>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-[10px] sm:text-xs font-medium italic">
                      No upcoming meetings
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 px-4">
                    <SiGooglecalendar size={24} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400 text-[9px] sm:text-xs font-medium leading-relaxed">
                      Connect with Google Calendar<br />to sync your meetings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* MAIN STATS SECTION */}
          <div className="order-1 lg:order-2 lg:col-span-8 space-y-6 lg:space-y-8">
            
            {/* Stats Grid */}
            <section aria-label="Key metrics" className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <StatCard 
                label="Today's Follow-ups"
                value={todayFollowUps}
                icon={FiCalendar}
                color="amber"
                trend="+2 from yesterday"
                onClick={() => navigate("/my-inquiries")}
              />
              <StatCard 
                label="Total Leads"
                value={totalInquiries}
                icon={FiMessageCircle}
                color="indigo"
                trend={`${convertedLeads} converted`}
              />
              <StatCard 
                label="Win Rate"
                value={`${winRate}%`}
                icon={FiTarget}
                color="emerald"
                trend={`${convertedLeads}/${totalInquiries} conversions`}
              />
            </section>

            {/* Charts & Tasks Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Pie Chart */}
              <section aria-label="Task distribution" className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                  Task Distribution
                </h3>
                <div className="h-[180px] sm:h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Pending Tasks */}
              <PendingTasks navigate={navigate} />
            </div>

            {/* Priority Alert */}
            {stats.upcomingDeadlines?.[0] && (
              <section aria-label="Priority task" className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                    <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-wider mb-1">
                      Priority Deadline
                    </p>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800">
                      {stats.upcomingDeadlines[0].title}
                    </h4>
                  </div>
                  <button
                    onClick={() => navigate(`/tasks/${stats.upcomingDeadlines[0]._id}`)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Start Task
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer Credit */}
        <footer className="text-center pt-4">
          <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            ITA-ERP • Employee Dashboard
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ================= ENHANCED COMPONENTS ================= */

function StatCard({ label, value, icon: Icon, color, trend, onClick }) {
  const colors = {
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      iconBg: "bg-amber-100"
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      iconBg: "bg-indigo-100"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100"
    }
  };

  const style = colors[color] || colors.indigo;

  return (
    <article 
      onClick={onClick}
      className={`${style.bg} ${style.border} border rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg cursor-pointer group`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
    >
      <header className="flex justify-between items-start mb-3">
        <div className={`p-2.5 ${style.iconBg} ${style.text} rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
        <Trending size={14} className="text-slate-300" />
      </header>
      
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        {trend && (
          <p className="text-[8px] sm:text-[9px] font-medium text-slate-400 mt-2">
            {trend}
          </p>
        )}
      </div>
    </article>
  );
}

function PendingTasks({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeePendingTasks()
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to load pending tasks:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          {[1,2,3].map(i => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.tasks?.length) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm text-center">
        <Award size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="text-sm text-slate-500 font-medium">No pending tasks</p>
        <p className="text-[10px] text-slate-400 mt-1">All caught up! 🎉</p>
      </div>
    );
  }

  return (
    <section aria-label="Pending tasks" className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm h-full">
      <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
        Pending Tasks ({data.tasks.length})
      </h3>
      
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
        {data.tasks.slice(0, 5).map(task => (
          <article
            key={task._id}
            onClick={() => navigate(`/tasks/${task._id}`)}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all cursor-pointer group"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                {task.title}
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
          </article>
        ))}
      </div>

      {data.tasks.length > 5 && (
        <button
          onClick={() => navigate("/my-task")}
          className="w-full mt-4 text-[9px] sm:text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider text-center"
        >
          View All ({data.tasks.length} tasks)
        </button>
      )}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 lg:space-y-8">
        {/* Hero Skeleton */}
        <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl lg:rounded-[2.5rem] animate-pulse" />
        
        {/* Plan Skeleton */}
        <div className="h-40 sm:h-48 bg-white rounded-2xl lg:rounded-3xl animate-pulse" />
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div className="h-96 bg-white rounded-2xl lg:rounded-3xl animate-pulse" />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white rounded-2xl animate-pulse" />
              <div className="h-64 bg-white rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardError() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to Load Dashboard</h2>
        <p className="text-sm text-slate-500 mb-6">Please try refreshing the page</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}