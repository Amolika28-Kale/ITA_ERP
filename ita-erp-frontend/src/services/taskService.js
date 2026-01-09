import API from "./api";

/* ================= TASK CRUD ================= */

// Create Task
export const createTask = (data) =>
  API.post("/tasks", data);

// Get tasks by project
export const fetchTasksByProject = (projectId) =>
  API.get(`/tasks/project/${projectId}`);

// Update task (title, priority, assignee, etc.)
export const updateTask = (id, data) =>
  API.put(`/tasks/${id}`, data);

// Delete task
export const deleteTask = (id) =>
  API.delete(`/tasks/${id}`);

/* ================= KANBAN ================= */

// Update task status (drag & drop)
export const updateTaskStatus = (id, status) =>
  API.patch(`/tasks/${id}/status`, { status });

/* ================= COMMENTS ================= */

// Add comment
export const addTaskComment = (taskId, message) =>
  API.post(`/tasks/${taskId}/comments`, { message });

// Get comments
export const fetchTaskComments = (taskId) =>
  API.get(`/tasks/${taskId}/comments`);
