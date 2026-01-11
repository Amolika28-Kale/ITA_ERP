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
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);

  const load = async () => {
    const [n, c] = await Promise.all([
      fetchNotifications(),
      fetchUnreadCount()
    ]);
    setList(n.data);
    setCount(c.data.count);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15000); // auto refresh
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50">
          <div className="flex justify-between items-center p-3 border-b">
            <h4 className="font-bold">Notifications</h4>
            <button
              onClick={async () => {
                await markAllRead();
                load();
              }}
              className="text-xs text-indigo-600"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {list.map(n => (
              <div
                key={n._id}
                onClick={async () => {
                  if (!n.read) {
                    await markNotificationRead(n._id);
                    load();
                  }
                }}
                className={`p-3 border-b cursor-pointer ${
                  n.read ? "bg-white" : "bg-indigo-50"
                }`}
              >
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
              </div>
            ))}

            {list.length === 0 && (
              <p className="p-4 text-center text-gray-400 text-sm">
                No notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
