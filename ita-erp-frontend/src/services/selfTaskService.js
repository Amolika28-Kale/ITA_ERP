import API from "./api";

export const getSelfTaskStatus = () => API.get("/self-tasks/status");

export const getTodayPlan = () => API.get("/self-tasks/today-plan");

export const submitPlan = (text) => API.post("/self-tasks/plan", { plannedTasks: text });

export const submitAchievement = (achievements) => 
    API.post("/self-tasks/achievement", { achievements });