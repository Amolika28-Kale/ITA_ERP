import axios from "axios";

const API = axios.create({
  // baseURL: "https://ita-erp.onrender.com/api/requirements",
    baseURL: "http://localhost:5000/api/requirements",

});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Employee
export const createRequirement = (data) =>
  API.post("/", data);

export const getMyRequirements = () =>
  API.get("/my");

export const getRequirementById = (id) =>
  API.get(`/${id}`);

export const updateRequirement = (id, data) =>
  API.put(`/${id}`, data);

export const deleteRequirement = (id) =>
  API.delete(`/${id}`);

// Admin
export const getAllRequirements = () =>
  API.get("/admin/all");

export const updateRequirementStatus = (id, data) =>
  API.patch(`/admin/${id}`, data);
