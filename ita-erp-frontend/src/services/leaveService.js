import API from "./api";

export const applyLeave = payload =>
  API.post("/leaves", payload);

export const fetchMyLeaves = () =>
  API.get("/leaves/my");

export const fetchLeaveRequests = () =>
  API.get("/leaves");

export const updateLeaveStatus = (id, status, adminComment) =>
  API.patch(`/leaves/${id}`, { status, adminComment });
