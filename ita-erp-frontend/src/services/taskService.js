import API from "./api";

/* ================= TASK CRUD ================= */

// Create Task
export const createTask = async (data) => {
  return API.post("/tasks", data);
};

// Get tasks by project
export const fetchTasksByProject = async () => {
  return API.get(`/tasks/all`);
};
//get my tasks
export const fetchMyTasks = async () => {
  return API.get(`/tasks/my`);
}
// Update task (title, description, priority, assignee, dueDate, etc.)
export const updateTask = async (id, data) => {
  return API.put(`/tasks/${id}`, data);
};

// Delete task
export const deleteTask = async (id) => {
  return API.delete(`/tasks/${id}`);
};

/* ================= KANBAN ================= */

// Update task status (Drag & Drop)
export const updateTaskStatus = async (id, status) => {
  return API.patch(`/tasks/${id}/status`, { status });
};


// Get my tasks todays (not completed today)
export const fetchTodayTasks = () =>
  API.get("/tasks/daily/today");

// Mark task as done for today
export const markTaskDoneToday = (id) =>
  API.patch(`/tasks/${id}/done-today`);

/* ================= COMMENTS ================= */

// Add comment to task
export const addTaskComment = async (taskId, message) => {
  return API.post(`/tasks/${taskId}/comments`, { message });
};

// Fetch comments for a task
export const fetchTaskComments = async (taskId) => {
  return API.get(`/tasks/${taskId}/comments`);
};
/* ================= SUBTASKS ================= */

export const fetchSubTasks = (taskId) =>
  API.get(`/tasks/${taskId}/subtasks`);

export const createSubTask = (taskId, data) =>
  API.post(`/tasks/${taskId}/subtasks`, data);

export const getTaskDetails = (id) =>
  API.get(`/tasks/${id}`);

// Update comment
export const updateTaskComment = (commentId, message) =>
  API.put(`/tasks/comments/${commentId}`, { message });

// Task activity
export const fetchTaskActivity = (taskId) =>
  API.get(`/tasks/${taskId}/activity`);
