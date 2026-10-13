import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import { emptyStateSx, statIconSx } from "../../../styles/commonStyles";
import { TaskPriorityChip, TaskStatusChip } from "./TaskChips";
import { formatDueDate, isOverdue } from "../utils/taskFormatters";
import {
  dueDateSx,
  overdueSx,
  taskMetaSx,
  taskRowMainSx,
  taskRowSideSx,
  taskRowSx,
  taskTitleSx,
} from "./taskStyles";

export default function TaskList({
  tasks,
  isLoading,
  error,
  onRetry,
  onSelect,
  showProject = true,
  emptyTitle = "No tasks found",
  emptyMessage = "Try changing your filters.",
}) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress aria-label="Loading tasks" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <Paper variant="outlined" sx={emptyStateSx}>
        <Box sx={{ ...statIconSx.indigo, mx: "auto", mb: 2 }}>
          <AssignmentOutlined />
        </Box>
        <Typography variant="h6">{emptyTitle}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" component="ul" sx={{ m: 0, p: 0, listStyle: "none", overflow: "hidden" }}>
      {tasks.map((task) => {
        const overdue = isOverdue(task);
        const meta = [
          showProject && task.project_name,
          task.assignee_name ? `Assigned to ${task.assignee_name}` : "Unassigned",
        ].filter(Boolean);

        return (
          <li key={task.id}>
            <ButtonBase
              sx={taskRowSx}
              onClick={() => onSelect(task)}
              aria-label={`Open task ${task.title}`}
            >
              <Box sx={taskRowMainSx}>
                <Typography sx={taskTitleSx}>{task.title}</Typography>
                <Typography sx={taskMetaSx}>{meta.join(" · ")}</Typography>
              </Box>

              <Box sx={taskRowSideSx}>
                <TaskPriorityChip priority={task.priority} />
                <TaskStatusChip status={task.status} />
                <Typography component="span" sx={overdue ? overdueSx : dueDateSx}>
                  {overdue ? "Overdue · " : ""}
                  {formatDueDate(task.due_date)}
                </Typography>
              </Box>
            </ButtonBase>
          </li>
        );
      })}
    </Paper>
  );
}
