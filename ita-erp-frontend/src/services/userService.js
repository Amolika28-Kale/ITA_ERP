import API from "./api";

/* ================= USERS ================= */

export const fetchUsers = () => API.get("/users");

export const createUser = (data) =>
  API.post("/users", data);

export const updateUser = (id, data) =>
  API.put(`/users/${id}`, data);

export const toggleUserStatus = (id) =>
  API.patch(`/users/${id}/status`);

export const assignUserToTeam = (id, teamId) =>
  API.patch(`/users/${id}/team`, { teamId });
