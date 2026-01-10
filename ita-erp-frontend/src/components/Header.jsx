import { LogOut, Bell, Search, Settings } from "lucide-react";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-8">
      <div className="hidden md:flex items-center max-w-md relative">
        <Search className="absolute left-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <Bell size={20} className="text-gray-400" />
        <Settings size={20} className="text-gray-400" />

        <div className="text-right">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-indigo-500 uppercase">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="p-2 text-red-500 hover:bg-red-50 rounded"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
