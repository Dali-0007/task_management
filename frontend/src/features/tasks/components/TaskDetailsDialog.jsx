import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import useTaskDetails from "../hooks/useTaskDetails";
import { TASK_STATUSES } from "../constants/taskOptions";
import { formatDateTime, formatDueDate, isOverdue } from "../utils/taskFormatters";
import { cardTitleSx, detailRowSx } from "../../../styles/commonStyles";
import { TaskPriorityChip, TaskStatusChip } from "./TaskChips";
import TaskComments from "./TaskComments";
import TaskFormDialog from "./TaskFormDialog";

function TaskDetails({ taskId, onClose, onChanged }) {
  const { task, setTask, isLoading, error, reload, updateStatus, deleteTask } =
    useTaskDetails(taskId);
  const [actionError, setActionError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleStatusChange(event) {
    setIsUpdating(true);
    setActionError("");
    const message = await updateStatus(event.target.value);
    setIsUpdating(false);

    if (message) setActionError(message);
    else onChanged();
  }

  async function handleDelete() {
    setIsUpdating(true);
    setActionError("");
    const message = await deleteTask();
    setIsUpdating(false);

    if (message) {
      setActionError(message);
      setConfirmDelete(false);
      return;
    }

    onChanged();
    onClose();
  }

  return (
    <>
      <DialogTitle sx={{ pr: 7 }}>
        Task details
        <IconButton
          onClick={onClose}
          aria-label="Close task details"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && !task && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress aria-label="Loading task" />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={reload}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {task && (
          <Stack spacing={2.5}>
            {actionError && (
              <Alert severity="error" onClose={() => setActionError("")}>
                {actionError}
              </Alert>
            )}

            <Box>
              <Typography component="h2" sx={{ ...cardTitleSx, fontSize: 18 }}>
                {task.title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                <TaskStatusChip status={task.status} />
                <TaskPriorityChip priority={task.priority} />
              </Stack>
            </Box>

            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {task.description || "No description provided."}
            </Typography>

            {task.permissions.canUpdateStatus && (
              <TextField
                select
                size="small"
                label="Update status"
                value={task.status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                sx={{ maxWidth: 260 }}
              >
                {TASK_STATUSES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Box>
              <Box sx={detailRowSx}>
                <span>Project</span>
                <span>{task.project_name}</span>
              </Box>
              <Box sx={detailRowSx}>
                <span>Assignee</span>
                <span>{task.assignee_name || "Unassigned"}</span>
              </Box>
              <Box sx={detailRowSx}>
                <span>Due date</span>
                <span>
                  {formatDueDate(task.due_date)}
                  {isOverdue(task) ? " (overdue)" : ""}
                </span>
              </Box>
              <Box sx={detailRowSx}>
                <span>Created by</span>
                <span>{task.created_by_name || "—"}</span>
              </Box>
              <Box sx={detailRowSx}>
                <span>Last updated</span>
                <span>{formatDateTime(task.updated_at)}</span>
              </Box>
            </Box>

            <Divider />

            <TaskComments taskId={task.id} canComment={task.permissions.canComment} />
          </Stack>
        )}
      </DialogContent>

      {task && (task.permissions.canEdit || task.permissions.canDelete) && (
        <DialogActions>
          {task.permissions.canDelete && (
            <Button
              color="error"
              startIcon={<DeleteOutlinedIcon />}
              onClick={() => setConfirmDelete(true)}
              disabled={isUpdating}
              sx={{ mr: "auto" }}
            >
              Delete
            </Button>
          )}
          {task.permissions.canEdit && (
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Edit task
            </Button>
          )}
        </DialogActions>
      )}

      {task && (
        <TaskFormDialog
          open={editOpen}
          task={task}
          onClose={() => setEditOpen(false)}
          onSaved={(saved) => {
            setTask(saved);
            setEditOpen(false);
            onChanged();
          }}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => !isUpdating && setConfirmDelete(false)} maxWidth="xs">
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            <strong>{task?.title}</strong> and its comments will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isUpdating}>
            {isUpdating ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Open by passing a taskId; close resets everything.
export default function TaskDetailsDialog({ taskId, onClose, onChanged = () => {} }) {
  return (
    <Dialog open={Boolean(taskId)} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      {taskId && (
        <TaskDetails key={taskId} taskId={taskId} onClose={onClose} onChanged={onChanged} />
      )}
    </Dialog>
  );
}
