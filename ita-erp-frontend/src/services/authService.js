// import axios from "axios";

// export const login = (data) =>
//   axios.post("https://ita-erp.onrender.com/api/auth/login", data);
//   // axios.post("http://localhost:5000/api/auth/login", data);

// import axios from "axios";

// const API = "https://ita-erp.onrender.com/api/auth";
// const API = "http://localhost:5000/api/auth";

import api from "./api";

export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);
export const resendOtp = (data) => api.post("/auth/resend-otp", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
// ✅ FIXED
export const getMe = () =>
  api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });