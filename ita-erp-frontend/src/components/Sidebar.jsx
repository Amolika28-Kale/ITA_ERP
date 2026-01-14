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
  ClipboardList
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logoutAttendance } from "../services/attendanceService";
import { fetchUnreadCount } from "../services/notificationService";
import {
  fetchTodayTasks,
  markTaskDoneToday
} from "../services/taskService";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [dailyTasks, setDailyTasks] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "employee";
  const navigate = useNavigate();

  const closeSidebar = () => setOpen(false);

  const logout = async () => {
    try {
      await logoutAttendance();
    } catch (err) {
      console.error("Attendance logout failed", err);
    } finally {
      localStorage.clear();
      navigate("/");
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
  }, []);

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
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-5 z-50 shadow">
        <h2 className="text-white font-bold tracking-wide">Task ERP</h2>
        <button onClick={() => setOpen(true)}>
          <Menu className="text-white" />
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      {open && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72
        bg-slate-900 text-slate-300 z-50
        flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* HEADER */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">Task ERP</h2>
            <span className="text-xs uppercase tracking-wide text-indigo-400">
              {role}
            </span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400">
            <X />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">

          {/* ===== ADMIN / MANAGER ===== */}
          {(role === "admin" || role === "manager") && (
            <>
              <Section title="Overview" />
              <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

              <Section title="Management" />
              <SidebarItem to="/users" icon={Users} label="Team Members" />
              <SidebarItem to="/teams" icon={Layers} label="Departments" />
              <SidebarItem to="/projects" icon={FolderKanban} label="Projects" />
              <SidebarItem to="/admin/attendance" icon={Layers} label="Attendance" />

              <Section title="Leave Management" />
              <SidebarItem to="/leave-requests" icon={ClipboardList} label="Leave Requests" />

              <Section title="Communication" />
              <SidebarItem
                to="/send-message"
                icon={Bell}
                label="Announcements"
                badge={unread}
              />
            </>
          )}

          {/* ===== EMPLOYEE ===== */}
          {role === "employee" && (
            <>
              <Section title="My Work" />
              <SidebarItem to="/employee-dashboard" icon={LayoutDashboard} label="Dashboard" />
              <SidebarItem to="/my-tasks" icon={Briefcase} label="My Tasks" />
              <SidebarItem to="/my-projects" icon={FolderKanban} label="My Projects" />

              {/* 📅 TODAY'S TASKS */}
              {dailyTasks.length > 0 && (
                <>
                  <Section title={`Today's Tasks (${dailyTasks.length})`} />

                  <div className="px-4 space-y-2">
                    {dailyTasks.map(task => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between
                        bg-slate-800 hover:bg-slate-700
                        rounded-lg px-3 py-2 transition"
                      >
                        <span className="text-sm text-slate-200 truncate">
                          {task.title}
                        </span>

                        <input
                          type="checkbox"
                          onChange={() => handleTaskTick(task._id)}
                          className="w-4 h-4 accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Section title="My Leaves" />
              <SidebarItem to="/apply-leave" icon={CalendarDays} label="Apply Leave" />
              <SidebarItem to="/my-leaves" icon={ClipboardList} label="My Leave Requests" />

              <Section title="Communication" />
              <SidebarItem
                to="/my-messages"
                icon={Bell}
                label="Announcements"
                badge={unread}
              />
            </>
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
            text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ===== SECTION LABEL ===== */
function Section({ title }) {
  return (
    <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-slate-500">
      {title}
    </p>
  );
}

/* ===== SIDEBAR ITEM ===== */
function SidebarItem({ icon: Icon, label, to, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          isActive
            ? "bg-indigo-600 text-white shadow"
            : "hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-0 h-full w-1 rounded-r ${
              isActive ? "bg-indigo-400" : "bg-transparent"
            }`}
          />
          <Icon size={18} />
          <span className="flex-1">{label}</span>

          {badge > 0 && (
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
