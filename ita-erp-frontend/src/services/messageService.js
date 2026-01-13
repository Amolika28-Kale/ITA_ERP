import API from "./api";

export const fetchInbox = () => API.get("/messages/inbox");
export const fetchSentMessages = () => API.get("/messages/sent");
export const fetchMessageById = id => API.get(`/messages/${id}`);
export const sendMessage = payload => API.post("/messages", payload);
