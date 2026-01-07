import axios from "axios";

const API = axios.create({
  baseURL: "https://ita-erp.onrender.com/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const fetchUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const toggleUserStatus = (id) =>
  API.patch(`/users/${id}/status`);
export const updateUser = (id, data) =>
  API.put(`/users/${id}`, data);

