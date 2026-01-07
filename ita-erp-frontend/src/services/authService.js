import axios from "axios";

export const login = (data) =>
  axios.post("https://ita-erp.onrender.com/api/auth/login", data);
