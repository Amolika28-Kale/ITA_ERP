import API from "./api";

/* ================= TASK REMINDER ================= */
export const fetchTaskReminder = () => {
  return API.get("/tasks/reminder");
};
