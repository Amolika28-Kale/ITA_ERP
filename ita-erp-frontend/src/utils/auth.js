export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getRole = () => {
  return getUser()?.role;
};

export const isAdmin = () => getRole() === "admin";
export const isManager = () => getRole() === "manager";
export const isEmployee = () => getRole() === "employee";

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
