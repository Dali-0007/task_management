import { useState } from "react";
import { Link } from "react-router-dom";
import { LinearProgress } from "@mui/material";
import {
  ArrowForward,
  CalendarMonthOutlined,
  FolderOutlined,
  GroupsOutlined,
} from "@mui/icons-material";
import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import SummaryCards from "../components/SummaryCards";
import useProjects from "../../projects/hooks/useProjects";
import useDashboardSummary from "../hooks/useDashboardSummary";
import TaskDetailsDialog from "../../tasks/components/TaskDetailsDialog";
import { TaskStatusChip } from "../../tasks/components/TaskChips";
import { TASK_STATUSES } from "../../tasks/constants/taskOptions";
import { formatDueDate, isOverdue } from "../../tasks/utils/taskFormatters";
import { describeActivity, formatRelativeTime } from "../utils/activityText";
import "../components/Dashboard.css";
import { useAuth } from "../../auth/context/AuthContext";

const MAX_DASHBOARD_PROJECTS = 3;

const STATUS_BAR_COLORS = {
  TODO: "inherit",
  IN_PROGRESS: "info",
  IN_REVIEW: "secondary",
  COMPLETED: "success",
};

function PanelState({ isLoading, error, onRetry, isEmpty, emptyText, children }) {
  if (isLoading) return <p className="dashboard-state">Loading...</p>;

  if (error) {
    return (
      <div className="dashboard-state dashboard-state-error" role="alert">
        <span>{error}</span>
        <button type="button" className="text-action" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (isEmpty) return <p className="dashboard-state">{emptyText}</p>;

  return children;
}

function UpcomingDeadlines({ tasks, isManager, onSelect, ...state }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Upcoming Deadlines</h2>
          <p>
            {isManager
              ? "Open tasks due in the next two weeks"
              : "Your open tasks due in the next two weeks"}
          </p>
        </div>
        <Link className="text-action" to="/dashboard/my-tasks">
          View all <ArrowForward fontSize="small" />
        </Link>
      </div>

      <PanelState {...state} isEmpty={!tasks?.length} emptyText="Nothing due soon.">
        <ul className="deadline-list">
          {tasks?.map((task) => (
            <li key={task.id}>
              <button type="button" className="deadline-item" onClick={() => onSelect(task.id)}>
                <span className="deadline-copy">
                  <strong>{task.title}</strong>
                  <span>
                    {task.project_name}
                    {isManager && ` · ${task.assignee_name || "Unassigned"}`}
                  </span>
                </span>
                <span className="deadline-side">
                  <TaskStatusChip status={task.status} />
                  <span className={isOverdue(task) ? "deadline-date deadline-overdue" : "deadline-date"}>
                    {isOverdue(task) ? "Overdue · " : ""}
                    {formatDueDate(task.due_date)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PanelState>
    </section>
  );
}

function StatusBreakdown({ counts, isManager, ...state }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Task Status</h2>
          <p>{isManager ? "All tasks in your projects" : "Tasks assigned to you"}</p>
        </div>
      </div>

      <PanelState {...state} isEmpty={!counts?.total} emptyText="No tasks yet.">
        <ul className="status-breakdown">
          {TASK_STATUSES.map((status) => {
            const count = counts?.[status.value.toLowerCase()] ?? 0;
            const percent = counts?.total ? Math.round((count / counts.total) * 100) : 0;

            return (
              <li key={status.value}>
                <div className="status-breakdown-label">
                  <span>{status.label}</span>
                  <strong>{count}</strong>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  color={STATUS_BAR_COLORS[status.value]}
                  aria-label={`${status.label}: ${count} of ${counts?.total}`}
                />
              </li>
            );
          })}
        </ul>
      </PanelState>
    </section>
  );
}

function ProjectOverview({ projects, progressById, ...state }) {
  const activeProjects = projects
    .filter((project) => project.status === "ACTIVE")
    .slice(0, MAX_DASHBOARD_PROJECTS);

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

      <PanelState
        {...state}
        isEmpty={activeProjects.length === 0}
        emptyText="You don't have any active projects yet."
      >
        <div className="project-list">
          {activeProjects.map((project) => {
            const progress = progressById[project.id];
            const percent = progress?.total_tasks
              ? Math.round((progress.completed_tasks / progress.total_tasks) * 100)
              : 0;

            return (
              <Link
                className="project-item"
                key={project.id}
                to={`/dashboard/projects/${project.id}/tasks`}
              >
                <div className="project-item-top">
                  <div className="project-icon"><FolderOutlined /></div>
                </div>
                <h3>{project.name}</h3>
                <p>{project.description || "No description provided."}</p>
                <div className="project-progress-label">
                  <span>Progress</span>
                  <strong>
                    {progress ? `${progress.completed_tasks}/${progress.total_tasks} tasks` : "—"}
                  </strong>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  aria-label={`${project.name} progress`}
                  className="project-progress"
                />
                <div className="project-meta">
                  <span>
                    <GroupsOutlined fontSize="small" /> {project.member_count ?? 0} members
                  </span>
                  <span className="project-active">Active</span>
                </div>
              </Link>
            );
          })}
        </div>
      </PanelState>
    </section>
  );
}

function ActivityPanel({ activity, ...state }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent Activity</h2>
          <p>Latest updates in your projects</p>
        </div>
      </div>

      <PanelState {...state} isEmpty={!activity?.length} emptyText="No activity yet.">
        <ul className="activity-list">
          {activity?.map((item) => (
            <li className="activity-item" key={item.id}>
              <div className="activity-avatar" aria-hidden="true">
                {item.actor_name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="activity-copy">
                <p>
                  <strong>{item.actor_name}</strong> {describeActivity(item)}
                </p>
                <span>{item.project_name}</span>
                <small>
                  <time dateTime={item.created_at}>{formatRelativeTime(item.created_at)}</time>
                </small>
              </div>
            </li>
          ))}
        </ul>
      </PanelState>
    </section>
  );
}

function DashboardContent({ role, user }) {
  const isManager = role === "PROJECT_MANAGER";
  const projectsState = useProjects();
  const summaryState = useDashboardSummary();
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { summary } = summaryState;
  const progressById = Object.fromEntries(
    (summary?.projectProgress ?? []).map((project) => [project.id, project])
  );

  const summaryPanelState = {
    isLoading: summaryState.isLoading,
    error: summaryState.error,
    onRetry: summaryState.reload,
  };

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
        projects={projectsState.projects}
        summary={summary}
        role={role}
        isLoading={projectsState.isLoading || summaryState.isLoading}
      />

      <div className="dashboard-lower-grid">
        <UpcomingDeadlines
          tasks={summary?.upcomingDeadlines}
          isManager={isManager}
          onSelect={setSelectedTaskId}
          {...summaryPanelState}
        />
        <StatusBreakdown
          counts={isManager ? summary?.tasks : summary?.myTasks}
          isManager={isManager}
          {...summaryPanelState}
        />
      </div>

      <div className="dashboard-lower-grid">
        <ProjectOverview
          projects={projectsState.projects}
          progressById={progressById}
          isLoading={projectsState.isLoading}
          error={projectsState.error}
          onRetry={() => projectsState.loadProjects().catch(() => {})}
        />
        <ActivityPanel activity={summary?.recentActivity} {...summaryPanelState} />
      </div>

      <TaskDetailsDialog
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onChanged={summaryState.reload}
      />
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
