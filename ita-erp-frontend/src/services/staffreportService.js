import API from "./api";

// ✅ STAFF: Submit manual 3-hour update
export const submitManualReport = (data) => {
  // data includes reportText and intervalSlot
  return API.post("/staff-reports/submit", data);
};

// ✅ ADMIN: Fetch all staff work logs
export const getAllStaffReports = () => {
  return API.get("/staff-reports/all");
};

// Existing interval report function
export const getIntervalReport = (params) => {
  // params should include employeeId, startTime, and endTime
  return API.get("/reports/interval", { params });
};