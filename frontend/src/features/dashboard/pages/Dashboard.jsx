
import {
  ArrowForward,
  CalendarMonthOutlined,
  CheckCircle,
  GroupsOutlined,
  MoreHoriz,
  TrendingUp,
} from "@mui/icons-material";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import SummaryCards from "../components/SummaryCards";
import TaskTable from "../components/TaskTable";
import { demoActivity, demoProjects } from "../data/dashboardData";
import "../components/Dashboard.css";
import { useAuth } from "../../auth/context/AuthContext";
function ProjectOverview() {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Active Projects</h2>
          <p>Progress across your workspace</p>
        </div>
        <button className="text-action">
          View all <ArrowForward fontSize="small" />
        </button>
      </div>

      <div className="project-list">
        {demoProjects.map((project) => (
          <article className="project-item" key={project.id}>
            <div className="project-item-top">
              <div className="project-icon"><CheckCircle /></div>
              <button className="icon-action" aria-label={`Options for ${project.name}`}>
                <MoreHoriz />
              </button>
            </div>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="project-progress-label">
              <span>Progress</span>
              <strong>{project.progress}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`${project.name} progress`}
              aria-valuenow={project.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="progress-fill" style={{ width: `${project.progress}%` }} />
            </div>
            <div className="project-meta">
              <span><GroupsOutlined fontSize="small" /> {project.members} members</span>
              <span className="project-active">{project.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className="dashboard-panel activity-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent Activity</h2>
          <p>Latest team updates</p>
        </div>
        <button className="icon-action" aria-label="Activity options">
          <MoreHoriz />
        </button>
      </div>
      <div className="activity-list">
        {demoActivity.map((activity, index) => (
          <article className="activity-item" key={activity.id}>
            <div className={`activity-avatar activity-avatar-${index + 1}`}>
              {activity.person.split(" ").map((part) => part[0]).join("")}
            </div>
            <div className="activity-copy">
              <p><strong>{activity.person}</strong> {activity.action}</p>
              <span>{activity.target}</span>
              <small>{activity.time}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardContent({ role, userName }) {
  const isManager = role === "PROJECT_MANAGER";

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <div>
          <div className="welcome-eyebrow">YOUR WORKSPACE</div>
          <h1>
            {isManager ? "Team Overview" : `Good to see you, ${userName}!`}
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

      <SummaryCards role={role} />

      <div className="dashboard-insight">
        <div className="insight-icon"><TrendingUp /></div>
        <div>
          <strong>{isManager ? "Your team is making progress" : "Keep your momentum going"}</strong>
          <p>
            {isManager
              ? "Review upcoming deadlines and check projects that need attention."
              : "Focus on your in-progress tasks and upcoming deadlines."}
          </p>
        </div>
      </div>

      <TaskTable role={role} />

      <div className="dashboard-lower-grid">
        <ProjectOverview />
        <ActivityPanel />
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
   <DashboardLayout>
      {(role) => (
        <DashboardContent role={role} userName={user.name} />
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
