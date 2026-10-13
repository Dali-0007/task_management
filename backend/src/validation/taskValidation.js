const { createHttpError } = require("../utils/httpError");

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TASK_SORT_FIELDS = ["due_date", "priority", "status", "title", "created_at", "updated_at"];

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;
const COMMENT_MAX = 2000;

const ID_PATTERN = /^[1-9]\d*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidId(value) {
  return ID_PATTERN.test(String(value ?? ""));
}

function requireId(value, label) {
  if (!isValidId(value)) {
    throw createHttpError(400, `Invalid ${label}.`);
  }
  return String(value);
}

function parseTitle(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, "Task title is required.");
  }
  if (value.trim().length > TITLE_MAX) {
    throw createHttpError(400, `Task title cannot exceed ${TITLE_MAX} characters.`);
  }
  return value.trim();
}

function parseDescription(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw createHttpError(400, "Description must be a string.");
  }
  if (value.length > DESCRIPTION_MAX) {
    throw createHttpError(400, `Description cannot exceed ${DESCRIPTION_MAX} characters.`);
  }
  return value.trim() || null;
}

function parseEnum(value, allowed, label) {
  if (!allowed.includes(value)) {
    throw createHttpError(400, `${label} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

function parseDueDate(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw createHttpError(400, "Due date must be in YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw createHttpError(400, "Due date is not a valid date.");
  }

  return value;
}

function parseAssigneeId(value) {
  if (value === null || value === undefined || value === "") return null;
  return requireId(value, "assignee");
}

function validateCreateTask(body = {}) {
  return {
    projectId: requireId(body.projectId, "project ID"),
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    status: body.status === undefined
      ? "TODO"
      : parseEnum(body.status, TASK_STATUSES, "Status"),
    priority: body.priority === undefined
      ? "MEDIUM"
      : parseEnum(body.priority, TASK_PRIORITIES, "Priority"),
    dueDate: parseDueDate(body.dueDate),
    assigneeId: parseAssigneeId(body.assigneeId),
  };
}

// Only the keys present in the body are returned, so callers can tell which
// fields the client is trying to change.
const UPDATE_PARSERS = {
  title: parseTitle,
  description: parseDescription,
  status: (value) => parseEnum(value, TASK_STATUSES, "Status"),
  priority: (value) => parseEnum(value, TASK_PRIORITIES, "Priority"),
  dueDate: parseDueDate,
  assigneeId: parseAssigneeId,
};

function validateUpdateTask(body = {}) {
  const unknown = Object.keys(body).filter((key) => !(key in UPDATE_PARSERS));
  if (unknown.length) {
    throw createHttpError(400, `Unknown task field(s): ${unknown.join(", ")}.`);
  }

  const changes = {};
  for (const [key, parse] of Object.entries(UPDATE_PARSERS)) {
    if (body[key] !== undefined) {
      changes[key] = parse(body[key]);
    }
  }

  if (!Object.keys(changes).length) {
    throw createHttpError(400, "No task changes were provided.");
  }

  return changes;
}

function validateTaskQuery(query = {}) {
  const filters = {};

  if (query.projectId !== undefined && query.projectId !== "") {
    filters.projectId = requireId(query.projectId, "project ID");
  }

  if (query.assignee !== undefined && query.assignee !== "") {
    if (query.assignee === "me" || query.assignee === "unassigned") {
      filters.assignee = query.assignee;
    } else {
      filters.assignee = requireId(query.assignee, "assignee");
    }
  }

  if (query.status) {
    filters.status = parseEnum(query.status, TASK_STATUSES, "Status");
  }

  if (query.priority) {
    filters.priority = parseEnum(query.priority, TASK_PRIORITIES, "Priority");
  }

  const search = String(query.search ?? "").trim();
  if (search.length > 100) {
    throw createHttpError(400, "Search cannot exceed 100 characters.");
  }
  if (search) filters.search = search;

  filters.sort = query.sort
    ? parseEnum(query.sort, TASK_SORT_FIELDS, "Sort")
    : "due_date";
  filters.order = query.order === "desc" ? "desc" : "asc";

  const limit = Number(query.limit ?? 100);
  const offset = Number(query.offset ?? 0);
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    throw createHttpError(400, "Limit must be between 1 and 200.");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw createHttpError(400, "Offset must be zero or greater.");
  }
  filters.limit = limit;
  filters.offset = offset;

  return filters;
}

function validateComment(body = {}) {
  const { content } = body;
  if (typeof content !== "string" || !content.trim()) {
    throw createHttpError(400, "Comment cannot be empty.");
  }
  if (content.trim().length > COMMENT_MAX) {
    throw createHttpError(400, `Comment cannot exceed ${COMMENT_MAX} characters.`);
  }
  return content.trim();
}

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  requireId,
  validateCreateTask,
  validateUpdateTask,
  validateTaskQuery,
  validateComment,
};
