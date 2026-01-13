import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= PAGES ================= */
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Teams from "./pages/Teams";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TaskDetails from "./pages/TaskDetails";
import Settings from "./pages/Settings";
import MyProjects from "./pages/MyProjects";
import AdminAttendance from "./pages/AdminAttendance";
import SendMessage from "./pages/SendMessage";
import MyMessages from "./pages/MyMessages";

/* 🔔 LEAVE / REQUEST */
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import LeaveRequests from "./pages/LeaveRequests";

/* ================= LAYOUT & GUARDS ================= */
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN / MANAGER ================= */}
        <Route element={<ProtectedRoute roles={["admin", "manager"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/tasks" element={<Tasks />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />

            {/* 🔔 Messaging */}
            <Route path="/send-message" element={<SendMessage />} />
            <Route path="/messages" element={<MyMessages />} />

            {/* 📝 Leave / Requests */}
            <Route path="/leave-requests" element={<LeaveRequests />} />
          </Route>
        </Route>

        {/* ================= EMPLOYEE ================= */}
        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/employee-dashboard"
              element={<EmployeeDashboard />}
            />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/projects/:projectId/tasks" element={<Tasks />} />

            {/* 🔔 Inbox */}
            <Route path="/my-messages" element={<MyMessages />} />

            {/* 📝 Leave / Requests */}
            <Route path="/apply-leave" element={<ApplyLeave />} />
            <Route path="/my-leaves" element={<MyLeaves />} />
          </Route>
        </Route>

        {/* ================= SHARED ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
