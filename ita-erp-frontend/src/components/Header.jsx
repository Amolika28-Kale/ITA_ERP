import { LogOut, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import useHourlyTaskReminder from "../hooks/useHourlyTaskReminder";
import TaskReminderPopup from "../components/TaskReminderPopup";
import { logoutAttendance } from "../services/attendanceService";
import AchievementModal from "./AchievementModal";
import toast from "react-hot-toast";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [showAchievement, setShowAchievement] = useState(false);
  const [popupData, setPopupData] = useState(null);
  // const [isLoggingOut, setIsLoggingOut] = useState(false);


  // 🔔 HOURLY TASK REMINDER
  useHourlyTaskReminder(setPopupData);

const forceLogout = async () => {
  await logoutAttendance();
  toast.success("Achievement submitted & logged out 👋");
  localStorage.clear();
  navigate("/");
};

const logout = async () => {
  try {
    await logoutAttendance();
    toast.success("Logged out successfully 👋");
    localStorage.clear();
    navigate("/");
  } catch (err) {
    if (err.response?.data?.code === "ACHIEVEMENT_REQUIRED") {
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
{showAchievement && (
  <AchievementModal
    onSuccess={async () => {
      setShowAchievement(false);
      await forceLogout(); // ✅ NOW WILL FIRE
    }}
  />
)}







    </>
  );
}
