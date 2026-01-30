import API from "./api";

export const createInquiry = (data) => API.post("/inquiries", data);
export const getInquiries = () => API.get("/inquiries");
export const updateInquiry = (id, data) => API.patch(`/inquiries/${id}`, data);