
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../features/auth/context/AuthContext";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <div className="dashboard-loading">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const role = user.role;

  return (
    <div className="dashboard-app">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="dashboard-page-content">
          {typeof children === "function" ? children(role) : children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
