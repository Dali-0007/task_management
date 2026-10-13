import { Navigate, Route, Routes } from "react-router-dom";
import SignIn from "../features/auth/pages/SignIn";
import SignUp from "../features/auth/pages/SignUp";
import Dashboard from "../features/dashboard/pages/Dashboard";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import MyTasksPage from "../features/tasks/pages/MyTasksPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import NotFoundPage from "../components/common/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/my-tasks" element={<MyTasksPage />} />
      <Route path="/dashboard/projects" element={<ProjectsPage />} />
      <Route path="/dashboard/profile" element={<ProfilePage />} />
      <Route path="/dashboard/*" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default AppRoutes;