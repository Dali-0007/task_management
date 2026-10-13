// Due dates arrive as "YYYY-MM-DD"; build a local date so they don't shift
// by a day in timezones west of UTC.
export function parseDueDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDueDate(value) {
  const date = parseDueDate(value);
  if (!date) return "No due date";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isOverdue(task) {
  const date = parseDueDate(task.due_date);
  if (!date || task.status === "COMPLETED") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

export function getApiErrorMessage(error, fallback) {
  if (!error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return error.response.data?.message || fallback;
}
