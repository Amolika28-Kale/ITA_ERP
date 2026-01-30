import { LogOut, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useState } from "react";
import useHourlyTaskReminder from "../hooks/useHourlyTaskReminder";
import TaskReminderPopup from "../components/TaskReminderPopup";
import { logoutAttendance } from "../services/attendanceService";
// ✅ AchievementModal ऐवजी SelfTaskModal इंपोर्ट करा
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
    // आपण achievements आधीच सेव्ह केल्या आहेत, आता थेट अटेंडन्स लॉगआउट करा
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

          <Settings
            size={20}
            className="text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={() => navigate("/settings")}
          />

          <div className="text-right leading-tight">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-indigo-500 uppercase font-black">{user?.role}</p>
          </div>

          <button
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition active:scale-90"
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

      {/* ✅ संध्याकाळचा Recap भरण्यासाठी नवीन मोडल वापरा */}
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