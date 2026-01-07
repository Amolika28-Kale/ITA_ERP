import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-40 inset-y-0 left-0 w-64 transform bg-gray-900
          transition-transform duration-300
          md:static md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">

        {/* Header */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-4 text-gray-600"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <Header />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Welcome, Admin 👋
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This is your Task ERP admin dashboard. Manage everything from here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
