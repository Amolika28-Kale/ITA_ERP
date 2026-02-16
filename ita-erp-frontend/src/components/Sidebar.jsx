import {
  LayoutDashboard,
  Users,
  Layers,
  FolderKanban,
  Menu,
  X,
  Briefcase,
  LogOut,
  Bell,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  GitPullRequest,
  Search,
  PhoneCall,
  BarChart3
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logoutAttendance } from "../services/attendanceService";
import { fetchUnreadCount } from "../services/notificationService";
import {
  fetchTodayTasks,
  markTaskDoneToday
} from "../services/taskService";
import NotificationBell from "./NotificationBell";
import AchievementModal from "./AchievementModal";
import toast from "react-hot-toast";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  // const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "employee";
  const navigate = useNavigate();

  const closeSidebar = () => setOpen(false);


const forceLogout = async () => {
  await logoutAttendance();
  toast.success("Achievement submitted & logged out 👋");
  localStorage.clear();
  navigate("/");
};

const logout = async () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  try {
    // 1. If Admin/Manager, logout directly without checking achievements
    if (user.role !== "employee") {
      await logoutAttendance();
      toast.success("Admin logged out 👋");
      localStorage.clear();
      navigate("/");
      return;
    }

    // 2. If Employee, proceed with the standard check
    await logoutAttendance();
    toast.success("Signed out successfully 👋");
    localStorage.clear();
    navigate("/");
  } catch (err) {
    // Show modal only if it's an employee and achievement is required
    if (user.role === "employee" && err.response?.data?.code === "ACHIEVEMENT_REQUIRED") {
      setShowAchievement(true);
    } else {
      toast.error("Logout failed");
    }
  }
};





  /* 🔔 Load unread notifications */
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await fetchUnreadCount();
        setUnread(res.data.count || 0);
      } catch {}
    };

    loadUnread();
    const interval = setInterval(loadUnread, 20000);
    return () => clearInterval(interval);
  }, []);

  /* 📅 Load daily tasks (EMPLOYEE only) */
  useEffect(() => {
    if (role === "employee") {
      loadDailyTasks();
    }
  }, [role]);

  const loadDailyTasks = async () => {
    try {
      const res = await fetchTodayTasks();
      setDailyTasks(res.data || []);
    } catch (err) {
      console.error("Failed to load daily tasks");
    }
  };

  const handleTaskTick = async (taskId) => {
    try {
      await markTaskDoneToday(taskId);
      setDailyTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error("Failed to update task");
    }
  };

  return (
    <>
    
      {/* ===== MOBILE TOP BAR (LIGHT) ===== */}
<div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-slate-200 
flex items-center justify-between px-5 z-50 shadow-sm">

  <h2 className="text-slate-900 font-black tracking-tight">ITA-ERP</h2>

  <div className="flex items-center gap-3">
    {/* 🔔 NOTIFICATION */}
    <NotificationBell />

    {/* ☰ MENU */}
    <button onClick={() => setOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
      <Menu className="text-slate-600" />
    </button>
  </div>
</div>


      {/* ===== OVERLAY ===== */}
      {open && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      {/* ===== SIDEBAR (LIGHT) ===== */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72
        bg-white text-slate-600 z-50 border-r border-slate-200
        flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* HEADER */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <div>
            <h2 className="text-slate-900 font-black text-xl tracking-tighter">ITA-ERP</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {role}
            </span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* NAV AREA */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">

          {/* ===== ADMIN / MANAGER SECTIONS ===== */}
          {(role === "admin" || role === "manager") && (
            <>
              <Section title="Overview" />
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

              <Section title="Management" />
              <SidebarItem to="/users" icon={Users} label="Team Members" />
              <SidebarItem to="/teams" icon={Layers} label="Departments" />
              <SidebarItem to="/all-tasks" icon={FolderKanban} label="Tasks" />
              <SidebarItem to="/my-tasks" icon={FolderKanban} label="My Tasks" />
              <SidebarItem to="/admin/attendance" icon={Layers} label="Attendance" />
              <SidebarItem to="/all-requests" icon={GitPullRequest} label="All Requests" />
              <SidebarItem to="/inquiries" icon={Search} label="Inquiry Engine" />
              <SidebarItem to="/admin/payments" icon={IndianRupee} label="Payment Collections"/>
              <SidebarItem to="/reports" icon={BarChart3} label="Reports"/>

              <Section title="Communication" />
              <SidebarItem
                to="/send-message"
                icon={Bell}
                label="Announcements"
                // badge={unread}
              />
            </>
          )}

          {/* ===== EMPLOYEE SECTIONS ===== */}
          {role === "employee" && (
            <>
              <Section title="My Work" />
              <SidebarItem to="/employee-dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/my-task" icon={Briefcase} label="My Tasks" />

              {/* 📅 TODAY'S TASKS LIST */}
              {dailyTasks.length > 0 && (
                <>
                  <Section title={`Today's Focus (${dailyTasks.length})`} />
                  <div className="px-2 space-y-2 mb-4">
                    {dailyTasks.map(task => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between
                        bg-slate-50 border border-slate-100
                        rounded-xl px-3 py-2.5 transition group hover:border-indigo-200"
                      >
                        <span className="text-xs font-semibold text-slate-700 truncate mr-2">
                          {task.title}
                        </span>
                        <input
                          type="checkbox"
                          onChange={() => handleTaskTick(task._id)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer rounded border-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
<SidebarItem to="/my-inquiries" icon={PhoneCall} label="My Inquiries" />
 
              <SidebarItem to="/my-requests" icon={GitPullRequest} label="My Requests"/>
              <SidebarItem to="/payments/my" icon={IndianRupee} label="Payment Collection"/>
              <SidebarItem to="/my-reports" icon={BarChart3} label="My Reports"/>

              <Section title="Communication" />
              <SidebarItem
                to="/my-messages"
                icon={Bell}
                label="Announcements"
              />
            </>
          )}
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
            text-rose-600 font-bold text-sm hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
{/* ✅ RECAP MODAL TRIGGER */}
      {showAchievement && (
        <AchievementModal
          onSuccess={async () => {
            setShowAchievement(false);
            await forceLogout(); 
          }}
          onCancel={() => setShowAchievement(false)}
        />
      )}






    </>
    
  );
}

/* ===== HELPER: SECTION LABEL ===== */
function Section({ title }) {
  return (
    <p className="px-4 pt-5 pb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      {title}
    </p>
  );
}

/* ===== HELPER: SIDEBAR ITEM ===== */
function SidebarItem({ icon: Icon, label, to, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
        transition-all duration-200
        ${
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{label}</span>

      {badge > 0 && (
        <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}