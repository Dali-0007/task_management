import { Link } from "react-router-dom";
import {
  ArrowForward,
  AssignmentOutlined,
  CalendarMonthOutlined,
  FolderOutlined,
  GroupsOutlined,
} from "@mui/icons-material";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import FeatureUnavailableNotice from "../../../components/common/FeatureUnavailableNotice";
import SummaryCards from "../components/SummaryCards";
import useProjects from "../../projects/hooks/useProjects";
import "../components/Dashboard.css";
import { useAuth } from "../../auth/context/AuthContext";

const MAX_DASHBOARD_PROJECTS = 3;

function ProjectOverview({ projects, isLoading, error, onRetry }) {
  const activeProjects = projects
    .filter((project) => project.status === "ACTIVE")
    .slice(0, MAX_DASHBOARD_PROJECTS);

  let body;

  if (isLoading) {
    body = <p className="dashboard-state">Loading projects...</p>;
  } else if (error) {
    body = (
      <div className="dashboard-state dashboard-state-error" role="alert">
        <span>{error}</span>
        <button type="button" className="text-action" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  } else if (activeProjects.length === 0) {
    body = (
      <p className="dashboard-state">
        You don&apos;t have any active projects yet.
      </p>
    );
  } else {
    body = (
      <div className="project-list">
        {activeProjects.map((project) => (
          <article className="project-item" key={project.id}>
            <div className="project-item-top">
              <div className="project-icon"><FolderOutlined /></div>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description || "No description provided."}</p>
            <div className="project-meta">
              <span>
                <GroupsOutlined fontSize="small" /> {project.member_count ?? 0} members
              </span>
              <span className="project-active">Active</span>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Active Projects</h2>
          <p>Your newest active projects</p>
        </div>
        <Link className="text-action" to="/dashboard/projects">
          View all <ArrowForward fontSize="small" />
        </Link>
      </div>

      {body}
    </section>
  );
}

function DashboardContent({ role, user }) {
  const isManager = role === "PROJECT_MANAGER";
  const { projects, isLoading, error, loadProjects } = useProjects();

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <div>
          <div className="welcome-eyebrow">YOUR WORKSPACE</div>
          <h1>
            {isManager ? "Team Overview" : `Good to see you, ${user.name}!`}
          </h1>
        </div>
        <div className="dashboard-date">
          <CalendarMonthOutlined fontSize="small" />
          {new Date().toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <SummaryCards
        projects={projects}
        role={role}
        userId={user.id}
        isLoading={isLoading}
      />

      <ProjectOverview
        projects={projects}
        isLoading={isLoading}
        error={error}
        onRetry={() => loadProjects().catch(() => {})}
      />

      <FeatureUnavailableNotice
        icon={AssignmentOutlined}
        title="Task insights aren't available yet"
      >
        Task counts, status breakdowns, upcoming deadlines and recent activity
        will appear here once the server provides task endpoints.
      </FeatureUnavailableNotice>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      {(role) => <DashboardContent role={role} user={user} />}
    </DashboardLayout>
  );
}

export default Dashboard;
