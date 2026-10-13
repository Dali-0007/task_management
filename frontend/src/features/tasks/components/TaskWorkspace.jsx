import { useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useTasks from "../hooks/useTasks";
import useDebouncedValue from "../hooks/useDebouncedValue";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";
import TaskDetailsDialog from "./TaskDetailsDialog";
import TaskFormDialog from "./TaskFormDialog";

const DEFAULT_FILTERS = {
  search: "",
  status: "",
  priority: "",
  projectId: "",
  sort: "due_date:asc",
};

// Filters, task list, details and creation for a fixed base query
// (e.g. "assigned to me" or "this project"). Used by My Tasks and the
// project task page.
export default function TaskWorkspace({
  baseQuery,
  filterProjects,
  createProjects = [],
  defaultProjectId,
  canCreate = false,
  showProject = true,
  emptyTitle,
  emptyMessage,
  onTasksChanged = () => {},
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(filters.search.trim());

  const query = useMemo(() => {
    const [sort, order] = filters.sort.split(":");
    const params = { ...baseQuery, sort, order, limit: 200 };

    if (search) params.search = search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.projectId) params.projectId = filters.projectId;

    return params;
  }, [baseQuery, search, filters.status, filters.priority, filters.projectId, filters.sort]);

  const { tasks, total, isLoading, error, reload } = useTasks(query);

  const hasFilters =
    Boolean(search || filters.status || filters.priority || filters.projectId);

  function handleChanged() {
    reload();
    onTasksChanged();
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Typography color="text.secondary" variant="body2" aria-live="polite">
          {isLoading
            ? "Loading tasks..."
            : `Showing ${tasks.length} of ${total} task${total === 1 ? "" : "s"}`}
        </Typography>

        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            New task
          </Button>
        )}
      </Stack>

      <TaskFilters filters={filters} onChange={setFilters} projects={filterProjects} />

      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onSelect={(task) => setSelectedTaskId(task.id)}
        showProject={showProject}
        emptyTitle={hasFilters ? "No matching tasks" : emptyTitle}
        emptyMessage={hasFilters ? "Try changing or clearing your filters." : emptyMessage}
      />

      <TaskDetailsDialog
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onChanged={handleChanged}
      />

      {canCreate && (
        <TaskFormDialog
          open={createOpen}
          projects={createProjects}
          defaultProjectId={defaultProjectId}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            handleChanged();
          }}
        />
      )}
    </Box>
  );
}
