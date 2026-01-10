import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function AdminOnly({ children }) {
  return isAdmin() ? children : <Navigate to="/dashboard" />;
}
