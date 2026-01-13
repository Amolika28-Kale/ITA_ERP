import { LogOut, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import useHourlyTaskReminder from "../hooks/useHourlyTaskReminder";
import TaskReminderPopup from "../components/TaskReminderPopup";
import { logoutAttendance } from "../services/attendanceService";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [popupData, setPopupData] = useState(null);

  // 🔔 HOURLY TASK REMINDER
  useHourlyTaskReminder(setPopupData);

 const logout = async () => {
    try {
      await logoutAttendance(); // ✅ BACKEND HIT
    } catch (err) {
      console.error("Attendance logout failed", err);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <>
      <header className="hidden lg:flex h-20 bg-white border-b items-center justify-between px-8">
        {/* SEARCH */}
        <div className="flex items-center max-w-md relative">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">
          <NotificationBell />

          <Settings
            size={20}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/settings")}
          />

          <div className="text-right leading-tight">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-indigo-500 uppercase">{user?.role}</p>
          </div>

          <button
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 🔥 TASK REMINDER POPUP */}
      {popupData && (
        <TaskReminderPopup
          data={popupData}
          onClose={() => setPopupData(null)}
        />
      )}
    </>
  );
}
