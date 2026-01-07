import API from "./api";
export const fetchTeams = () => API.get("/teams");
export const createTeam = (data) => API.post("/teams", data);
export const updateTeam = (id, data) =>
  API.put(`/teams/${id}`, data);
