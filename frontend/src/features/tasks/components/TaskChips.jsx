import { Chip } from "@mui/material";
import {
  PRIORITY_BY_VALUE,
  STATUS_BY_VALUE,
} from "../constants/taskOptions";

export function TaskStatusChip({ status }) {
  const option = STATUS_BY_VALUE[status];
  return <Chip size="small" label={option?.label ?? status} color={option?.color} />;
}

export function TaskPriorityChip({ priority }) {
  const option = PRIORITY_BY_VALUE[priority];
  return (
    <Chip
      size="small"
      variant="outlined"
      label={option?.label ?? priority}
      color={option?.color}
    />
  );
}
