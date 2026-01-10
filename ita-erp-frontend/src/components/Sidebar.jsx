import {
  LayoutDashboard,
  Users,
  Layers,
  FolderKanban,
  Menu,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  return (
    <>
      {/* Mobile Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-40">
        <h2 className="text-white font-bold">Task ERP</h2>
        <button onClick={() => setOpen(true)}>
          <Menu className="text-white" />
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 z-50 transition-transform
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-20 flex items-center justify-between px-6">
          <h2 className="text-white font-bold">Task ERP</h2>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X />
          </button>
        </div>

        <nav className="px-4 space-y-2">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {role !== "employee" && (
            <SidebarItem to="/users" icon={Users} label="Team Members" />
          )}

          {role !== "employee" && (
            <SidebarItem to="/teams" icon={Layers} label="Departments" />
          )}

          <SidebarItem to="/projects" icon={FolderKanban} label="Projects" />
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm
        ${isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800"}`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
