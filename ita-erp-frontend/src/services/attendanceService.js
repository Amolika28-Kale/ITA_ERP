import axios from "axios";

export const logoutAttendance = () =>
  axios.post(
    "https://ita-erp.onrender.com/api/attendance/logout",
      // "http://localhost:5000/api/attendance/logout",

    
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  export const submitAchievement = (achievement) =>
  axios.post(
    "https://ita-erp.onrender.com/api/attendance/achievement",
          // "http://localhost:5000/api/attendance/achievement",

    { achievement },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

