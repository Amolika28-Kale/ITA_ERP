import API from "./api";

/* ================= TEAMS ================= */

export const fetchTeams = () => API.get("/teams");

export const fetchTeamById = (id) => {
  console.log("Fetching team by ID:", id);
  return API.get(`/teams/${id}`);
};

export const createTeam = (data) => API.post("/teams", data);

export const updateTeam = (id, data) => API.put(`/teams/${id}`, data);

export const disableTeam = (id) => API.patch(`/teams/${id}/disable`);

/* ================= MEMBER MANAGEMENT ================= */

export const addMemberToTeam = (teamId, userId) => {
  console.log("Adding member to team:", { teamId, userId });
  
  // Validate inputs
  if (!teamId || !userId) {
    console.error("Missing teamId or userId");
    return Promise.reject(new Error("Team ID and User ID are required"));
  }
  
  // Make sure IDs are strings
  const tid = String(teamId);
  const uid = String(userId);
  
  console.log("Making POST request to:", `/teams/${tid}/members`);
  
  return API.post(`/teams/${tid}/members`, { userId: uid })
    .then(response => {
      console.log("Add member success:", response);
      return response;
    })
    .catch(error => {
      console.error("Add member error:", {
        message: error.message,
        response: error.response,
        data: error.response?.data
      });
      throw error;
    });
};

export const removeMemberFromTeam = (teamId, userId) => {
  console.log("Removing member from team:", { teamId, userId });
  return API.delete(`/teams/${teamId}/members/${userId}`);
};

export const getAvailableEmployees = (teamId) => {
  console.log("Fetching available employees for team:", teamId);
  
  if (!teamId) {
    console.error("No teamId provided to getAvailableEmployees");
    return Promise.reject(new Error("Team ID is required"));
  }
  
  const id = String(teamId);
  console.log("Using team ID:", id);
  
  return API.get(`/teams/${id}/available-employees`)
    .then(response => {
      console.log("getAvailableEmployees success:", response);
      return response;
    })
    .catch(error => {
      console.error("getAvailableEmployees error:", {
        message: error.message,
        response: error.response,
        config: error.config
      });
      throw error;
    });
};