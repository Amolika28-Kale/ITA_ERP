import api from "./api";

export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);
export const resendOtp = (data) => api.post("/auth/resend-otp", data);
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);

// ✅ Fetch current user profile
export const getMe = () =>
  api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

/**
 * ✅ GOOGLE CALENDAR SYNC
 * Fetches events from the user's synchronized Google Calendar account
 */
export const fetchGoogleEvents = () => 
  api.get("/auth/google/calendar", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });