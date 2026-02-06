import api from "./api";

/* ================= EMPLOYEE ================= */

export const createPayment = data =>
  api.post("/payments", data);

export const getMyPayments = () =>
  api.get("/payments/my");
// Add this to your existing exports
export const getPaymentById = id =>
  api.get(`/payments/${id}`);

export const updatePayment = (id, data) =>
  api.put(`/payments/${id}`, data);

// export const deletePayment = id =>
//   api.delete(`/payments/${id}`);

/* ================= ADMIN ================= */

export const getAllPayments = () =>
  api.get("/payments");

// In paymentCollectionService.js
export const deletePaymentByAdmin = (id) => api.delete(`/payments/${id}`);
