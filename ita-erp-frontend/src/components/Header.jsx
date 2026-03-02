import { LogOut, Search, Settings, User, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import useHourlyTaskReminder from "../hooks/useHourlyTaskReminder";
import TaskReminderPopup from "../components/TaskReminderPopup";
import { logoutAttendance } from "../services/attendanceService";
import toast from "react-hot-toast";
import AchievementModal from "./AchievementModal";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [showAchievement, setShowAchievement] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // 🔔 HOURLY TASK REMINDER
  useHourlyTaskReminder(setPopupData);

  const forceLogout = async () => {
    await logoutAttendance();
    toast.success("Work logged & signed out 👋");
    localStorage.clear();
    navigate("/");
  };

  const logout = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      // 1. If Admin/Manager, logout directly without checking achievements
      if (user.role !== "employee") {
        await logoutAttendance();
        toast.success("Admin logged out 👋");
        localStorage.clear();
        navigate("/");
        return;
      }

      // 2. If Employee, proceed with the standard check
      await logoutAttendance();
      toast.success("Signed out successfully 👋");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      // Show modal only if it's an employee and achievement is required
      if (user.role === "employee" && err.response?.data?.code === "ACHIEVEMENT_REQUIRED") {
        setShowAchievement(true);
      } else {
        toast.error("Logout failed");
      }
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

          {/* ✅ Profile Icon - यावर click केल्यावर Profile उघडेल */}
          <div className="relative group">
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-indigo-50 transition-all group"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-700">{user?.name}</p>
                <p className="text-[10px] text-indigo-500 uppercase font-black">{user?.role}</p>
              </div>
            </button>

            {/* Optional: Hover Tooltip */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              My Profile
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition active:scale-90"
            title="Logout"
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

      {/* ✅ संध्याकाळचा Recap भरण्यासाठी मोडल */}
      {showAchievement && (
        <AchievementModal
          onSuccess={async () => {
            setShowAchievement(false);
            await forceLogout(); 
          }}
          onCancel={() => setShowAchievement(false)}
        />
      )}
    </>
  );
}