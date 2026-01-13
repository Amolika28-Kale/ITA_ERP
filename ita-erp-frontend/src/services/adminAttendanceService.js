import API from "./api";

/* ================= ADMIN DAILY ATTENDANCE ================= */
export const fetchDailyAttendance = (date) => {
  const query = date ? `?date=${date}` : "";
  return API.get(`/admin/attendance${query}`);
};
