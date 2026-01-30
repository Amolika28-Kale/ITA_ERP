import API from "./api";

/* EMPLOYEE */
export const createRequest = (data) => API.post("/requests", data);
export const getMyRequests = () => API.get("/requests/my");
export const getRequestById = (id) => API.get(`/requests/${id}`);
export const updateRequest = (id, data) => API.put(`/requests/${id}`, data);
export const deleteRequest = (id) => API.delete(`/requests/${id}`);

/* ADMIN */
export const getAllRequests = () => API.get("/requests/admin/all");
export const updateRequestStatus = (id, data) => API.patch(`/requests/admin/${id}`, data);