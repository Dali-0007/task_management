import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  TASK_PRIORITIES,
  TASK_SORT_OPTIONS,
  TASK_STATUSES,
} from "../constants/taskOptions";
import { filterBarSx } from "./taskStyles";

// Controlled filter bar. Pass `projects` to show the project filter.
export default function TaskFilters({ filters, onChange, projects }) {
  const update = (key) => (event) =>
    onChange({ ...filters, [key]: event.target.value });

  return (
    <Box sx={filterBarSx}>
      <TextField
        size="small"
        label="Search tasks"
        value={filters.search}
        onChange={update("search")}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
          htmlInput: { maxLength: 100 },
        }}
      />

      <TextField select size="small" label="Status" value={filters.status} onChange={update("status")}>
        <MenuItem value="">All statuses</MenuItem>
        {TASK_STATUSES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField select size="small" label="Priority" value={filters.priority} onChange={update("priority")}>
        <MenuItem value="">All priorities</MenuItem>
        {TASK_PRIORITIES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {projects && (
        <TextField select size="small" label="Project" value={filters.projectId} onChange={update("projectId")}>
          <MenuItem value="">All projects</MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={String(project.id)}>
              {project.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField select size="small" label="Sort by" value={filters.sort} onChange={update("sort")}>
        {TASK_SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
