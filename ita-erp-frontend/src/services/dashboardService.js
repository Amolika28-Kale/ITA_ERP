import API from "./api";
export const fetchDashboardStats = () => API.get("/dashboard");

export const fetchEmployeeDashboard = () => API.get("/dashboard/employee");
  
