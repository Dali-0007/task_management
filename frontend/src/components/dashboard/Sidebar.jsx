
import { NavLink } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  AssignmentOutlined,
  FolderOutlined,
  GroupsOutlined,
  Person,
  SettingsOutlined,
  Close,
  TaskAlt,
} from "@mui/icons-material";
import "./DashboardLayout.css";

const commonItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "My Tasks", path: "/dashboard/my-tasks", icon: AssignmentOutlined },
  { label: "Projects", path: "/dashboard/projects", icon: FolderOutlined },
];

function Sidebar({ role, open, onClose }) {
  const managerItems =
    role === "PROJECT_MANAGER"
      ? [{ label: "Team Management", path: "/dashboard/team", icon: GroupsOutlined }]
      : [];

  const items = [
    ...commonItems,
    ...managerItems,
    { label: "My Profile", path: "/dashboard/profile", icon: Person },
  ];

  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`dashboard-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">ADN</div>
          <div>
            <div className="brand-name">ADN TECH</div>
            <div className="brand-caption">Task Manager</div>
          </div>
          <button
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <Close />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
              onClick={onClose}
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">
            <TaskAlt />
          </div>
          <div>
            <strong>Stay on track</strong>
            <p>Small steps, great results.</p>
          </div>
        </div>

        <div className="sidebar-settings">
          <SettingsOutlined fontSize="small" />
          <span>Workspace settings</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
