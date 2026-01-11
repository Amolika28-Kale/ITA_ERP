import API from "./api";

/* ================= ADMIN / USER DASHBOARD ================= */

// Admin → all activities
// User → only related activities
export const fetchRecentActivity = () =>
  API.get("/activity/recent");

/* ================= PROJECT PAGE ================= */

export const fetchActivityByProject = (projectId) =>
  API.get(`/activity/project/${projectId}`);

/* ================= TASK PAGE ================= */

export const fetchActivityByTask = (taskId) =>
  API.get(`/activity/task/${taskId}`);
