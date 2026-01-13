import API from "./api";

export const fetchDashboardStats = () => API.get("/dashboard");
export const fetchEmployeeDashboard = () => API.get("/dashboard/employee");

export const fetchEmployeePendingTasks = () =>
  API.get("/dashboard/employee/pending");

export const fetchPendingTasks = () =>
  API.get("/dashboard/pending-tasks");
