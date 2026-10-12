
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu as MenuIcon,
  Search,
  NotificationsNone,
  KeyboardArrowDown,
  LogoutOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/context/AuthContext";
import "./DashboardLayout.css";

function Topbar({ user, onMenuClick }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const roleLabel =
    user.role === "PROJECT_MANAGER" ? "Project Manager" : "Team Member";

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError("");

    try {
      await signOut();
      navigate("/sign-in", { replace: true });
    } catch {
      setSignOutError("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="dashboard-topbar">
      <button
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <MenuIcon />
      </button>

      <div className="topbar-search">
        <Search fontSize="small" />
        <input aria-label="Search" placeholder="Search tasks, projects..." />
        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-actions">
        <button
          className="notification-button"
          aria-label="Notifications"
          title="Notifications demo"
        >
          <NotificationsNone />
          <span className="notification-dot" />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <div className="user-avatar">{initials}</div>
          <div className="topbar-user-details">
            <strong>{user.name}</strong>
            <span>{roleLabel}</span>
          </div>
          <KeyboardArrowDown className="user-chevron" />
        </div>

        <button
          className="sign-out-button"
          title="Sign out"
          aria-label="Sign out"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogoutOutlined />
        </button>
      </div>

      {signOutError && (
        <p role="alert" className="auth-error">
          {signOutError}
        </p>
      )}
    </header>
  );
}

export default Topbar;
