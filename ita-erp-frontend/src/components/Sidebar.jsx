import {
  LayoutDashboard,
  Users,
  Settings
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col">
      
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold tracking-wide text-white">
          Task ERP
        </h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active
        />

        <SidebarItem
          icon={<Users size={18} />}
          label="Users"
        />

        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
        />

      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
        © 2026 Task ERP
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition
        ${active 
          ? "bg-gray-800 text-white" 
          : "hover:bg-gray-800 hover:text-white"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
