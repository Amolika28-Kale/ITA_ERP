import { LogOut } from "lucide-react";

export default function Header() {
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      
      {/* Left */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-xs text-gray-500">
          Task ERP Management
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Admin</p>
          <p className="text-xs text-gray-500">admin@erp.com</p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
          A
        </div>

        {/* Logout (UI only) */}
        <button
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
