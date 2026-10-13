
import { NavLink } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  AssignmentOutlined,
  FolderOutlined,
  Person,
  Close,
} from "@mui/icons-material";
import "./DashboardLayout.css";

const commonItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "My Tasks", path: "/dashboard/my-tasks", icon: AssignmentOutlined },
  { label: "Projects", path: "/dashboard/projects", icon: FolderOutlined },
];

function Sidebar({ open, onClose }) {
  const items = [
    ...commonItems,
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
      </aside>
    </>
  );
}

export default Sidebar;
