
import { ArrowForward, MoreHoriz } from "@mui/icons-material";
import { demoTasks } from "../data/dashboardData";
import "./Dashboard.css";

function TaskTable({ role }) {
  const tasks =
    role === "TEAM_MEMBER"
      ? demoTasks.filter((task) => task.assignee === "Dali Naidu")
      : demoTasks;

  return (
    <section className="dashboard-panel task-panel">
      <div className="panel-heading">
        <div>
          <h2>{role === "TEAM_MEMBER" ? "My Tasks" : "Recent Tasks"}</h2>
          <p>
            {role === "TEAM_MEMBER"
              ? "Tasks assigned to you"
              : "Track work across your projects"}
          </p>
        </div>
        <button className="text-action">
          View all <ArrowForward fontSize="small" />
        </button>
      </div>

      <div className="task-table-wrap">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              {role === "PROJECT_MANAGER" && <th>Assignee</th>}
              <th>Priority</th>
              <th>Status</th>
              <th>Due date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div className="task-title">{task.title}</div>
                  <div className="task-project">{task.project} · {task.id}</div>
                </td>
                {role === "PROJECT_MANAGER" && (
                  <td>
                    <div className="assignee-cell">
                      <span className="assignee-avatar">
                        {task.assignee.split(" ").map((part) => part[0]).join("")}
                      </span>
                      {task.assignee}
                    </div>
                  </td>
                )}
                <td>
                  <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${task.status.toLowerCase().replaceAll(" ", "-")}`}>
                    <span className="status-dot" />
                    {task.status}
                  </span>
                </td>
                <td className="task-date">
                  {new Date(`${task.dueDate}T12:00:00`).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td>
                  <button className="icon-action" aria-label={`More options for ${task.title}`}>
                    <MoreHoriz />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default TaskTable;
