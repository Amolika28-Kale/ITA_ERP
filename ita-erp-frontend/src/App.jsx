import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";

import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TaskDetails from "./pages/TaskDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN & MANAGER ================= */}
        <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/tasks" element={<Tasks />} />
          </Route>
        </Route>

        {/* ================= EMPLOYEE ================= */}
        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />

               <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/tasks" element={<Tasks />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
