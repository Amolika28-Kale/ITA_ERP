import API from "./api";

export const fetchActivityByProject = (projectId) =>
  API.get(`/activity/project/${projectId}`);

export const fetchActivityByTask = (taskId) =>
  API.get(`/activity/task/${taskId}`);

