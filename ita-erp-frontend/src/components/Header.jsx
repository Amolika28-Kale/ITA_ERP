import { LogOut } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 md:px-6">
      
      {/* Left */}
      <div>
        <h1 className="text-base md:text-lg font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="hidden sm:block text-xs text-gray-500">
          Task ERP Management
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* User Info */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-700">Admin</p>
          <p className="text-xs text-gray-500">admin@erp.com</p>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
          A
        </div>

        {/* Logout */}
        <button
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
