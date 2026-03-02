import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllRead
} from "../services/notificationService";

export default function NotificationBell({ onUnreadCountChange }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Initialize audio using Web Audio API (no external file needed)
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      audioRef.current = {
        play: () => {
          // Create oscillator for beep sound
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = 800; // 800 Hz frequency
          gainNode.gain.value = 0.1; // Volume
          
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15); // 150ms duration
        }
      };
    } else {
      // Fallback for browsers that don't support Web Audio
      audioRef.current = {
        play: () => {
          console.log("Sound not supported in this browser");
        }
      };
    }

    // Request notification permission for browser notifications
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);

      setNotifications(listRes.data);
      const newCount = countRes.data.count;
      
      // ✅ Play sound if unread count increased (new notification)
      if (newCount > unreadCount && unreadCount > 0) {
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play();
        }
        
        // Optional: Show browser notification
        if (Notification.permission === "granted") {
          new Notification("New Notification", {
            body: `You have ${newCount - unreadCount} new notification${newCount - unreadCount > 1 ? 's' : ''}`,
            icon: "/favicon.ico",
            silent: false
          });
        }

        // Optional: Vibrate on mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(200); // Vibrate for 200ms
        }
      }
      
      setUnreadCount(newCount);
      setPrevUnreadCount(unreadCount);
      
      // Call parent callback if provided
      if (onUnreadCountChange) {
        onUnreadCountChange(newCount);
      }
    } catch (err) {
      console.error("Notification error:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  /* ================= HANDLE CLICK ================= */
  const handleNotificationClick = async n => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
    }

    setOpen(false);
    loadNotifications();

    // 🔗 Open message if linked
    if (n.entityType === "chat" && n.entityId) {
      navigate(`/messages/${n.entityId}`);
    }
  };

  /* ================= FORMAT TIME ================= */
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition active:scale-95"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600" />

        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
            <div>
              <h4 className="font-semibold text-sm">Notifications</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await markAllRead();
                  loadNotifications();
                }}
                className="text-xs text-indigo-600 hover:underline hover:text-indigo-700 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No notifications</p>
                <p className="text-xs text-gray-300 mt-1">You're all caught up!</p>
              </div>
            )}

            {notifications.map(n => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`px-4 py-3 border-b cursor-pointer transition-all hover:shadow-inner ${
                  n.isRead
                    ? "bg-white hover:bg-gray-50"
                    : "bg-indigo-50 hover:bg-indigo-100 border-l-4 border-l-indigo-500"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-indigo-900' : 'text-gray-800'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse shrink-0 mt-1.5"></span>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {n.message}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[9px] text-gray-400">
                    {formatTime(n.createdAt)}
                  </p>
                  {n.entityType === "chat" && (
                    <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Message
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t bg-gray-50/50">
             
            </div>
          )}
        </div>
      )}
    </div>
  );
}