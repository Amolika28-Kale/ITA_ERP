import API from "./api";

/* ================= PROJECTS ================= */

export const fetchProjects = () => API.get("/projects");

export const createProject = (data) =>
  API.post("/projects", data);
/*
data = {
  name,
  description,
  team,
  members: []
}
*/

export const updateProject = (id, data) =>
  API.put(`/projects/${id}`, data);

export const archiveProject = (id) =>
  API.patch(`/projects/${id}/archive`);

export const updateProjectStatus = (id, status) =>
  API.patch(`/projects/${id}/status`, { status });
