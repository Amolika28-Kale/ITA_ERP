import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ roles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.isActive === false) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "employee" ? "/employee-dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
