import {
  LayoutDashboard,
  Users,
  Layers,
  FolderKanban,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col fixed">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold tracking-wide text-white">
          Task ERP
        </h2>
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
  );
}

/* ================= SIDEBAR ITEM ================= */
function SidebarItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all
         ${isActive
           ? "bg-gray-800 text-white"
           : "text-gray-300 hover:bg-gray-800 hover:text-white"
         }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
