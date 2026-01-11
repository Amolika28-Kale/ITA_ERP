import API from "./api";

export const fetchNotifications = () =>
  API.get("/notifications");

export const fetchUnreadCount = () =>
  API.get("/notifications/unread-count");

export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}/read`);

export const markAllRead = () =>
  API.put("/notifications/mark-all-read");
