// services/settingsService.js
import API from "./api";

export const fetchMyProfile = () => API.get("/settings/me");

export const updateProfile = (data) => API.put("/settings/me", data);

export const changePassword = (data) => API.put("/settings/change-password", data);

// Admin: Get all staff
export const getAllStaff = () => API.get("/settings/admin/staff");

export const getStaffById = (id) => API.get(`/settings/admin/staff/${id}`);