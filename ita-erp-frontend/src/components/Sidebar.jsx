import {
  LayoutDashboard,
  Users,
  Layers,
  FolderKanban,
  ListChecks,
  Menu,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-40">
        <h2 className="text-white font-bold tracking-wide">Task ERP</h2>
        <button onClick={() => setOpen(true)}>
          <Menu className="text-white" />
        </button>
      </div>

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 z-50 transition-transform
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">Task ERP</h2>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400">
            <X />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">

          {/* ADMIN / MANAGER DASHBOARD */}
          {(role === "admin" || role === "manager") && (
            <SidebarItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={closeSidebar}
            />
          )}

          {/* EMPLOYEE DASHBOARD */}
       {role === "employee" && (
  <>
    <SidebarItem to="/employee-dashboard" icon={LayoutDashboard} label="My Dashboard" />
    <SidebarItem to="/my-tasks" icon={FolderKanban} label="My Tasks" />
  </>
)}


          {/* USERS & TEAMS */}
          {(role === "admin" || role === "manager") && (
            <>
              <SidebarItem
                to="/users"
                icon={Users}
                label="Team Members"
                onClick={closeSidebar}
              />
              <SidebarItem
                to="/teams"
                icon={Layers}
                label="Departments"
                onClick={closeSidebar}
              />
            </>
          )}

          {/* PROJECTS (ALL ROLES) */}
          <SidebarItem
            to="/projects"
            icon={FolderKanban}
            label="Projects"
            onClick={closeSidebar}
          />
        </nav>
      </aside>
    </>
  );
}

/* ================= SIDEBAR ITEM ================= */

function SidebarItem({ icon: Icon, label, to, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
        ${
          isActive
            ? "bg-indigo-600 text-white"
            : "hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
