import axios from "axios";

const api = axios.create({
  baseURL: "https://ita-erp.onrender.com/api"
  // baseURL:"http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

export default api;
