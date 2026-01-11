import {
  LayoutDashboard,
  Users,
  Layers,
  FolderKanban,
  Menu,
  X,
  Briefcase,
  LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "employee";

  const closeSidebar = () => setOpen(false);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
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
        <nav className="flex-1 px-4 py-6 space-y-1">

          {(role === "admin" || role === "manager") && (
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          )}

          {role === "employee" && (
            <>
              <SidebarItem to="/employee-dashboard" icon={LayoutDashboard} label="My Dashboard" />
              <SidebarItem to="/my-tasks" icon={Briefcase} label="My Tasks" />
              <SidebarItem to="/my-projects" icon={FolderKanban} label="My Projects" />
            </>
          )}

          {(role === "admin" || role === "manager") && (
            <>
              <SidebarItem to="/users" icon={Users} label="Team Members" />
              <SidebarItem to="/teams" icon={Layers} label="Departments" />
            </>
          )}

          {/* <SidebarItem to="/projects" icon={FolderKanban} label="Projects" /> */}
        </nav>

        {/* ===== LOGOUT (BOTTOM) ===== */}
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

/* ===== SIDEBAR ITEM ===== */

function SidebarItem({ icon: Icon, label, to }) {
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
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
