import API from "./api";

// ✅ STAFF: Submit manual report with time slot
export const submitManualReport = (data) => {
  // data includes reportText and timeSlot { startTime, endTime, label }
  return API.post("/staff-reports/submit", data);
};

// ✅ ADMIN: Fetch all staff work logs
export const getAllStaffReports = () => {
  return API.get("/staff-reports/all");
};

// ✅ ADMIN: Get reports filtered by date
export const getReportsByDate = (date) => {
  return API.get("/staff-reports/by-date", { params: { date } });
};

// ✅ STAFF: Check if already submitted for a specific time slot today
export const checkSlotSubmission = (startTime, endTime, date) => {
  return API.get("/staff-reports/check-slot", {
    params: { startTime, endTime, date }
  });
};

// Existing interval report function
export const getIntervalReport = (params) => {
  // params should include employeeId, startTime, and endTime
  return API.get("/reports/interval", { params });
};