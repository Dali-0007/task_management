// Stored API values mapped to display labels and MUI chip colours.
export const TASK_STATUSES = [
  { value: "TODO", label: "To Do", color: "default" },
  { value: "IN_PROGRESS", label: "In Progress", color: "info" },
  { value: "IN_REVIEW", label: "In Review", color: "secondary" },
  { value: "COMPLETED", label: "Completed", color: "success" },
];

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: "default" },
  { value: "MEDIUM", label: "Medium", color: "primary" },
  { value: "HIGH", label: "High", color: "warning" },
  { value: "URGENT", label: "Urgent", color: "error" },
];

export const TASK_SORT_OPTIONS = [
  { value: "due_date:asc", label: "Due date (soonest)" },
  { value: "priority:desc", label: "Priority (highest)" },
  { value: "status:asc", label: "Status" },
  { value: "updated_at:desc", label: "Recently updated" },
  { value: "created_at:desc", label: "Newest" },
  { value: "title:asc", label: "Title (A–Z)" },
];

const byValue = (options) =>
  Object.fromEntries(options.map((option) => [option.value, option]));

export const STATUS_BY_VALUE = byValue(TASK_STATUSES);
export const PRIORITY_BY_VALUE = byValue(TASK_PRIORITIES);
