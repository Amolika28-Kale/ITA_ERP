import API from "./api";

export const getSelfTaskStatus = () => API.get("/self-tasks/status");

export const submitPlan = (text) => API.post("/self-tasks/plan", { plannedTasks: text });

export const submitAchievement = (achievements) => 
    API.post("/self-tasks/achievement", { achievements });