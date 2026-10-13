import { STATUS_BY_VALUE } from "../../tasks/constants/taskOptions";

// Turns an activity_log row into the sentence after the actor's name.
export function describeActivity(activity) {
  const { action, details = {} } = activity;
  const title = details.title ? `"${details.title}"` : "a task";

  switch (action) {
    case "TASK_CREATED":
      return `created ${title}`;
    case "TASK_STATUS_CHANGED":
      return `moved ${title} to ${STATUS_BY_VALUE[details.to]?.label ?? details.to}`;
    case "TASK_ASSIGNED":
      return details.assigneeName
        ? `assigned ${title} to ${details.assigneeName}`
        : `unassigned ${title}`;
    case "TASK_UPDATED":
      return `updated ${title}`;
    case "TASK_DELETED":
      return `deleted ${title}`;
    case "COMMENT_ADDED":
      return `commented on ${title}`;
    default:
      return `updated ${title}`;
  }
}

export function formatRelativeTime(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 60) return "just now";
  if (seconds < 3600) return formatter.format(-Math.round(seconds / 60), "minute");
  if (seconds < 86400) return formatter.format(-Math.round(seconds / 3600), "hour");
  return formatter.format(-Math.round(seconds / 86400), "day");
}
