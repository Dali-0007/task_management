import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import useProjectMembers from "../../projects/hooks/useProjectMembers";
import taskService from "../services/taskService";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants/taskOptions";
import { getApiErrorMessage } from "../utils/taskFormatters";

const TITLE_MAX = 200;

function initialForm(task, defaultProjectId) {
  return {
    projectId: String(task?.project_id ?? defaultProjectId ?? ""),
    title: task?.title ?? "",
    description: task?.description ?? "",
    assigneeId: task?.assignee_id ? String(task.assignee_id) : "",
    status: task?.status ?? "TODO",
    priority: task?.priority ?? "MEDIUM",
    dueDate: task?.due_date ?? "",
  };
}

// Mounted only while the dialog is open, so the form resets on each open.
function TaskForm({ task, projects, defaultProjectId, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(() => initialForm(task, defaultProjectId));
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { members, isLoading: membersLoading, error: membersError } =
    useProjectMembers(form.projectId || null);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({
      ...previous,
      [key]: value,
      // A new project has different members.
      ...(key === "projectId" ? { assigneeId: "" } : {}),
    }));
    setFieldErrors((previous) => ({ ...previous, [key]: "" }));
  };

  function validate() {
    const errors = {};
    if (!form.projectId) errors.projectId = "Choose a project.";
    if (!form.title.trim()) errors.title = "Title is required.";
    else if (form.title.trim().length > TITLE_MAX) {
      errors.title = `Title cannot exceed ${TITLE_MAX} characters.`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving || !validate()) return;

    setIsSaving(true);
    setSubmitError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigneeId: form.assigneeId || null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
    };

    try {
      const saved = isEdit
        ? await taskService.updateTask(task.id, payload)
        : await taskService.createTask({ ...payload, projectId: form.projectId });
      onSaved(saved);
    } catch (saveError) {
      setSubmitError(getApiErrorMessage(saveError, "Unable to save the task."));
      setIsSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>

      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Stack spacing={2} sx={{ pt: 1 }}>
          {!isEdit && (
            <TextField
              select
              required
              label="Project"
              value={form.projectId}
              onChange={update("projectId")}
              error={Boolean(fieldErrors.projectId)}
              helperText={fieldErrors.projectId || (projects.length === 0 ? "You have no active projects." : "")}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={String(project.id)}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            required
            autoFocus
            label="Title"
            value={form.title}
            onChange={update("title")}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
            slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={update("description")}
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: 5000 } }}
          />

          <TextField
            select
            label="Assignee"
            value={form.assigneeId}
            onChange={update("assigneeId")}
            disabled={!form.projectId || membersLoading}
            error={Boolean(membersError)}
            helperText={
              membersError ||
              (form.projectId ? "Only members of this project can be assigned." : "Choose a project first.")
            }
          >
            <MenuItem value="">Unassigned</MenuItem>
            {members.map((member) => (
              <MenuItem key={member.id} value={String(member.id)}>
                {member.name} ({member.email})
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={update("status")}>
              {TASK_STATUSES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth label="Priority" value={form.priority} onChange={update("priority")}>
              {TASK_PRIORITIES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            type="date"
            label="Due date"
            value={form.dueDate}
            onChange={update("dueDate")}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create task"}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function TaskFormDialog({
  open,
  onClose,
  onSaved,
  task = null,
  projects = [],
  defaultProjectId,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open && (
        <TaskForm
          task={task}
          projects={projects}
          defaultProjectId={defaultProjectId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}
