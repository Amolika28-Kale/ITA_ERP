import { Navigate } from "react-router-dom";

export default function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
