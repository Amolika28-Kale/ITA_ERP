import API from "./api";

/* ================= TEAMS ================= */

export const fetchTeams = () => API.get("/teams");

export const createTeam = (data) =>
  API.post("/teams", data);

export const updateTeam = (id, data) =>
  API.put(`/teams/${id}`, data);

export const disableTeam = (id) =>
  API.patch(`/teams/${id}/disable`);
