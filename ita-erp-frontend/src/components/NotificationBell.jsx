import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllRead
} from "../services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);

      setNotifications(listRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-full"
      >
        <Bell size={20} className="text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h4 className="font-semibold text-sm">Notifications</h4>

            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await markAllRead();
                  loadNotifications();
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-400">
                No notifications
              </p>
            )}

            {notifications.map(n => (
              <div
                key={n._id}
                onClick={async () => {
                  if (!n.isRead) {
                    await markNotificationRead(n._id);
                    loadNotifications();
                  }
                }}
                className={`px-4 py-3 border-b cursor-pointer transition ${
                  n.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-indigo-50 hover:bg-indigo-100"
                }`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
