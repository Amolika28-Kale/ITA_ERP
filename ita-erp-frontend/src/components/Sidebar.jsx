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

  return (
    <>
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 flex items-center px-4 z-40">
        <button onClick={() => setOpen(true)} className="text-white">
          <Menu size={22} />
        </button>
        <h2 className="ml-4 text-white font-semibold">Task ERP</h2>
      </div>

      {/* ===== OVERLAY ===== */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gray-900 text-gray-200 flex flex-col z-50 transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Task ERP</h2>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/users" icon={Users} label="Users" />
          <SidebarItem to="/teams" icon={Layers} label="Teams" />
          <SidebarItem to="/projects" icon={FolderKanban} label="Projects" />
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
          © 2026 Task ERP
        </div>
      </aside>
    </>
  );
}

/* ================= SIDEBAR ITEM ================= */
function SidebarItem({ icon, label, to }) {
  const Icon = icon;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-md transition
        ${
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}
