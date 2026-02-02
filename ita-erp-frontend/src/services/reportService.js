import API from "./api";

export const getIntervalReport = (params) => {
  // params should include employeeId, startTime, and endTime
  return API.get("/reports/interval", { params });
};