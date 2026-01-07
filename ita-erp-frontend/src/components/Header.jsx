import { LogOut, Bell, Search, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-8">
      
      {/* Search Bar - Hidden on Mobile */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative group">
        <Search className="absolute left-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search records, teams, or projects..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent border focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl outline-none text-sm transition-all"
        />
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-2 md:gap-6 ml-auto">
        
        {/* Actions */}
        <div className="flex items-center gap-1 border-r border-gray-100 pr-4">
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all">
            <Settings size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden lg:block">
            {/* <p className="text-sm font-bold text-gray-900 leading-none">Alex Rivera</p> */}
            <p className="text-[11px] text-indigo-500 font-bold uppercase mt-1">Super Admin</p>
          </div>
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 group-hover:shadow-md transition-all cursor-pointer">
              AR
            </div>
            {/* Simple logout overlay for attractiveness */}
            <button 
              className="absolute -bottom-1 -right-1 p-1 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 shadow-sm transition-colors"
              title="Logout"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}