import API from "./api";

// ✅ STAFF: Submit manual report with time slot
export const submitManualReport = (data) => {
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

// ✅ STAFF: Get my report history with filters
export const getMyReports = async (filter = "week") => {
  console.log("🔍 Fetching my reports with filter:", filter);
  try {
    const response = await API.get("/staff-reports/my-reports", { 
      params: { filter } 
    });
    console.log("✅ Reports fetched successfully:", response.data.length);
    return response;
  } catch (error) {
    console.error("❌ Error fetching my reports:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

// Existing interval report function
export const getIntervalReport = (params) => {
  return API.get("/reports/interval", { params });
};