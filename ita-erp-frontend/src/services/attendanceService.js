import axios from "axios";

export const logoutAttendance = () =>
  axios.post(
    "https://ita-erp.onrender.com/api/attendance/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
