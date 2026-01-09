import { LayoutDashboard, Users, Layers, FolderKanban, Menu, X, ChevronRight, ListChecks } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-40 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">T</div>
          <h2 className="text-white font-bold tracking-tight">Task ERP</h2>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 bg-slate-800 rounded-lg text-white">
          <Menu size={20} />
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col z-50 transform transition-all duration-300 ease-in-out border-r border-slate-800
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Task ERP</h2>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/users" icon={Users} label="Team Members" />
          <SidebarItem to="/teams" icon={Layers} label="Departments" />
          <SidebarItem to="/projects" icon={FolderKanban} label="Active Projects" />
            <SidebarItem to="/tasks" icon={ListChecks} label="Tasks Board" />
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 mt-auto">
          {/* <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs font-semibold text-indigo-400">Pro Plan</p>
            <p className="text-[11px] text-slate-400 mt-1">Unlimited storage & users</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full w-2/3" />
            </div>
          </div> */}
          <p className="mt-6 text-[10px] text-center text-slate-600 font-medium tracking-tighter">
            © 2026 TASK ERP • VERSION 2.4
          </p>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium
        ${isActive 
          ? "bg-indigo-600/10 text-white" 
          : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? "text-indigo-400" : "group-hover:text-slate-100"} />
          <span className="text-[14px] flex-1">{label}</span>
          {isActive && (
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          )}
          <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "hidden" : ""}`} />
        </>
      )}
    </NavLink>
  );
}