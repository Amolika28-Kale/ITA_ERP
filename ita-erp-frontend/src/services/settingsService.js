import API from "./api";

export const fetchMyProfile = () => API.get("/settings/me");

export const updateProfile = (data) =>
  API.put("/settings/me", data);

export const changePassword = (data) =>
  API.put("/settings/change-password", data);
