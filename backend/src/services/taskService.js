const pool = require("../config/database");
const { createHttpError } = require("../utils/httpError");

// Every task query joins `viewer` so users only ever see tasks in projects
// they belong to. Tasks outside those projects are reported as not found,
// which avoids revealing that they exist.
const TASK_COLUMNS = `
  t.id,
  t.project_id,
  p.name AS project_name,
  p.status AS project_status,
  t.title,
  t.description,
  t.status,
  t.priority,
  to_char(t.due_date, 'YYYY-MM-DD') AS due_date,
  t.assignee_id,
  assignee.name AS assignee_name,
  assignee.email AS assignee_email,
  t.created_by,
  creator.name AS created_by_name,
  t.created_at,
  t.updated_at`;

const TASK_FROM = `
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
  JOIN project_members viewer
    ON viewer.project_id = t.project_id
   AND viewer.user_id = $1
  LEFT JOIN users assignee ON assignee.id = t.assignee_id
  LEFT JOIN users creator ON creator.id = t.created_by`;

const SORT_SQL = {
  due_date: "t.due_date",
  title: "lower(t.title)",
  created_at: "t.created_at",
  updated_at: "t.updated_at",
  priority: `CASE t.priority
               WHEN 'URGENT' THEN 4 WHEN 'HIGH' THEN 3
               WHEN 'MEDIUM' THEN 2 ELSE 1 END`,
  status: `CASE t.status
             WHEN 'TODO' THEN 1 WHEN 'IN_PROGRESS' THEN 2
             WHEN 'IN_REVIEW' THEN 3 ELSE 4 END`,
};

const FIELD_COLUMNS = {
  title: "title",
  description: "description",
  status: "status",
  priority: "priority",
  dueDate: "due_date",
  assigneeId: "assignee_id",
};

function isManager(user) {
  return user.role === "PROJECT_MANAGER";
}

// Permissions the client can use to decide which actions to show. The same
// rules are enforced again on every write below.
function withPermissions(task, user) {
  const projectActive = task.project_status === "ACTIVE";
  const canManage = projectActive && isManager(user);
  const isAssignee = String(task.assignee_id) === String(user.id);

  return {
    ...task,
    permissions: {
      canEdit: canManage,
      canDelete: canManage,
      canUpdateStatus: canManage || (projectActive && isAssignee),
      canComment: projectActive,
    },
  };
}

async function logActivity(client, { projectId, taskId, actorId, action, details }) {
  await client.query(
    `INSERT INTO activity_log (project_id, task_id, actor_id, action, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [projectId, taskId, actorId, action, JSON.stringify(details)]
  );
}

async function findVisibleTask(client, taskId, userId) {
  const result = await client.query(
    `SELECT ${TASK_COLUMNS} ${TASK_FROM} WHERE t.id = $2`,
    [userId, taskId]
  );
  return result.rows[0] || null;
}

async function requireAssignableMember(client, projectId, assigneeId) {
  if (assigneeId === null) return null;

  const result = await client.query(
    `SELECT u.id, u.name
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 AND pm.user_id = $2`,
    [projectId, assigneeId]
  );

  if (!result.rowCount) {
    throw createHttpError(400, "The assignee must be a member of this project.");
  }

  return result.rows[0];
}

async function inTransaction(work) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listTasks(user, filters) {
  const params = [user.id];
  const where = [];

  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.projectId) {
    // A project the user cannot see is reported as not found.
    const membership = await pool.query(
      `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [filters.projectId, user.id]
    );
    if (!membership.rowCount) {
      throw createHttpError(404, "Project not found.");
    }
    where.push(`t.project_id = ${add(filters.projectId)}`);
  }

  if (filters.assignee === "me") {
    where.push(`t.assignee_id = ${add(user.id)}`);
  } else if (filters.assignee === "unassigned") {
    where.push("t.assignee_id IS NULL");
  } else if (filters.assignee) {
    where.push(`t.assignee_id = ${add(filters.assignee)}`);
  }

  if (filters.status) where.push(`t.status = ${add(filters.status)}`);
  if (filters.priority) where.push(`t.priority = ${add(filters.priority)}`);

  if (filters.search) {
    const pattern = add(`%${filters.search}%`);
    where.push(`(t.title ILIKE ${pattern} OR t.description ILIKE ${pattern})`);
  }

  const direction = filters.order === "desc" ? "DESC" : "ASC";
  const orderBy = `${SORT_SQL[filters.sort]} ${direction} NULLS LAST, t.id DESC`;

  const result = await pool.query(
    `SELECT ${TASK_COLUMNS}, COUNT(*) OVER()::INTEGER AS total_count
     ${TASK_FROM}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY ${orderBy}
     LIMIT ${add(filters.limit)} OFFSET ${add(filters.offset)}`,
    params
  );

  const total = result.rows[0]?.total_count ?? 0;
  const tasks = result.rows.map(({ total_count, ...task }) =>
    withPermissions(task, user)
  );

  return { tasks, total };
}

async function getTask(user, taskId) {
  const task = await findVisibleTask(pool, taskId, user.id);

  if (!task) {
    throw createHttpError(404, "Task not found.");
  }

  return withPermissions(task, user);
}

async function createTask(user, data) {
  if (!isManager(user)) {
    throw createHttpError(403, "Only Project Managers can create tasks.");
  }

  return inTransaction(async (client) => {
    const project = await client.query(
      `SELECT p.id, p.status
       FROM projects p
       JOIN project_members pm
         ON pm.project_id = p.id AND pm.user_id = $2
       WHERE p.id = $1
       FOR UPDATE OF p`,
      [data.projectId, user.id]
    );

    if (!project.rowCount) {
      throw createHttpError(404, "Project not found.");
    }

    if (project.rows[0].status !== "ACTIVE") {
      throw createHttpError(409, "Tasks cannot be added to an archived project.");
    }

    const assignee = await requireAssignableMember(
      client,
      data.projectId,
      data.assigneeId
    );

    const inserted = await client.query(
      `INSERT INTO tasks
         (project_id, title, description, status, priority,
          due_date, assignee_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.projectId,
        data.title,
        data.description,
        data.status,
        data.priority,
        data.dueDate,
        data.assigneeId,
        user.id,
      ]
    );

    const taskId = inserted.rows[0].id;

    await logActivity(client, {
      projectId: data.projectId,
      taskId,
      actorId: user.id,
      action: "TASK_CREATED",
      details: { title: data.title, assigneeName: assignee?.name ?? null },
    });

    return withPermissions(await findVisibleTask(client, taskId, user.id), user);
  });
}

async function updateTask(user, taskId, changes) {
  return inTransaction(async (client) => {
    const current = await client.query(
      `SELECT t.id, t.project_id, t.title, t.description, t.status,
              t.priority, to_char(t.due_date, 'YYYY-MM-DD') AS due_date,
              t.assignee_id, p.status AS project_status
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN project_members viewer
         ON viewer.project_id = t.project_id AND viewer.user_id = $2
       WHERE t.id = $1
       FOR UPDATE OF t`,
      [taskId, user.id]
    );

    if (!current.rowCount) {
      throw createHttpError(404, "Task not found.");
    }

    const task = current.rows[0];

    if (task.project_status !== "ACTIVE") {
      throw createHttpError(409, "Tasks in an archived project cannot be changed.");
    }

    if (!isManager(user)) {
      const fields = Object.keys(changes);

      if (fields.some((field) => field !== "status")) {
        throw createHttpError(403, "Team Members can only update the status of a task.");
      }

      if (String(task.assignee_id) !== String(user.id)) {
        throw createHttpError(403, "You can only update the status of tasks assigned to you.");
      }
    }

    let assignee = null;
    if (changes.assigneeId !== undefined) {
      assignee = await requireAssignableMember(
        client,
        task.project_id,
        changes.assigneeId
      );
    }

    const previous = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id === null ? null : String(task.assignee_id),
    };

    const changed = Object.keys(changes).filter(
      (field) => changes[field] !== previous[field]
    );

    if (changed.length) {
      const params = [taskId];
      const assignments = changed.map((field) => {
        params.push(changes[field]);
        return `${FIELD_COLUMNS[field]} = $${params.length}`;
      });

      await client.query(
        `UPDATE tasks
         SET ${assignments.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        params
      );

      const title = changes.title ?? task.title;
      const base = { projectId: task.project_id, taskId, actorId: user.id };

      if (changed.includes("status")) {
        await logActivity(client, {
          ...base,
          action: "TASK_STATUS_CHANGED",
          details: { title, from: task.status, to: changes.status },
        });
      }

      if (changed.includes("assigneeId")) {
        await logActivity(client, {
          ...base,
          action: "TASK_ASSIGNED",
          details: { title, assigneeName: assignee?.name ?? null },
        });
      }

      const otherFields = changed.filter(
        (field) => field !== "status" && field !== "assigneeId"
      );

      if (otherFields.length) {
        await logActivity(client, {
          ...base,
          action: "TASK_UPDATED",
          details: { title, fields: otherFields },
        });
      }
    }

    return withPermissions(await findVisibleTask(client, taskId, user.id), user);
  });
}

async function deleteTask(user, taskId) {
  return inTransaction(async (client) => {
    const task = await findVisibleTask(client, taskId, user.id);

    if (!task) {
      throw createHttpError(404, "Task not found.");
    }

    if (!isManager(user)) {
      throw createHttpError(403, "Only Project Managers can delete tasks.");
    }

    if (task.project_status !== "ACTIVE") {
      throw createHttpError(409, "Tasks in an archived project cannot be deleted.");
    }

    // Comments are removed by ON DELETE CASCADE; the activity entry keeps the
    // title so the history still reads correctly.
    await client.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    await logActivity(client, {
      projectId: task.project_id,
      taskId: null,
      actorId: user.id,
      action: "TASK_DELETED",
      details: { title: task.title },
    });
  });
}

async function listComments(user, taskId) {
  const task = await findVisibleTask(pool, taskId, user.id);

  if (!task) {
    throw createHttpError(404, "Task not found.");
  }

  const result = await pool.query(
    `SELECT c.id, c.task_id, c.content, c.created_at,
            c.user_id AS author_id, u.name AS author_name
     FROM task_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.task_id = $1
     ORDER BY c.created_at ASC, c.id ASC`,
    [taskId]
  );

  return result.rows;
}

async function addComment(user, taskId, content) {
  return inTransaction(async (client) => {
    const task = await findVisibleTask(client, taskId, user.id);

    if (!task) {
      throw createHttpError(404, "Task not found.");
    }

    if (task.project_status !== "ACTIVE") {
      throw createHttpError(409, "Comments cannot be added in an archived project.");
    }

    const result = await client.query(
      `INSERT INTO task_comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id, content, created_at, user_id AS author_id`,
      [taskId, user.id, content]
    );

    await logActivity(client, {
      projectId: task.project_id,
      taskId,
      actorId: user.id,
      action: "COMMENT_ADDED",
      details: { title: task.title },
    });

    return { ...result.rows[0], author_name: user.name };
  });
}

const STATUS_COUNTS = `
  COUNT(*)::INTEGER AS total,
  COUNT(*) FILTER (WHERE t.status = 'TODO')::INTEGER AS todo,
  COUNT(*) FILTER (WHERE t.status = 'IN_PROGRESS')::INTEGER AS in_progress,
  COUNT(*) FILTER (WHERE t.status = 'IN_REVIEW')::INTEGER AS in_review,
  COUNT(*) FILTER (WHERE t.status = 'COMPLETED')::INTEGER AS completed,
  COUNT(*) FILTER (
    WHERE t.status <> 'COMPLETED' AND t.due_date < CURRENT_DATE
  )::INTEGER AS overdue`;

const UPCOMING_WINDOW_DAYS = 14;

async function getSummary(user) {
  const [all, mine, upcoming, progress, activity] = await Promise.all([
    pool.query(`SELECT ${STATUS_COUNTS} ${TASK_FROM}`, [user.id]),

    pool.query(
      `SELECT ${STATUS_COUNTS} ${TASK_FROM} WHERE t.assignee_id = $1`,
      [user.id]
    ),

    // Managers see deadlines across their projects; team members see their own.
    pool.query(
      `SELECT ${TASK_COLUMNS} ${TASK_FROM}
       WHERE t.status <> 'COMPLETED'
         AND t.due_date IS NOT NULL
         AND t.due_date <= CURRENT_DATE + $2::INTEGER
         AND ($3::BOOLEAN OR t.assignee_id = $1)
       ORDER BY t.due_date ASC, t.id ASC
       LIMIT 6`,
      [user.id, UPCOMING_WINDOW_DAYS, isManager(user)]
    ),

    pool.query(
      `SELECT p.id, p.name,
              COUNT(t.id)::INTEGER AS total_tasks,
              COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED')::INTEGER
                AS completed_tasks
       FROM projects p
       JOIN project_members viewer
         ON viewer.project_id = p.id AND viewer.user_id = $1
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.status = 'ACTIVE'
       GROUP BY p.id`,
      [user.id]
    ),

    pool.query(
      `SELECT a.id, a.action, a.details, a.created_at, a.task_id,
              a.project_id, p.name AS project_name,
              a.actor_id, u.name AS actor_name
       FROM activity_log a
       JOIN projects p ON p.id = a.project_id
       JOIN project_members viewer
         ON viewer.project_id = a.project_id AND viewer.user_id = $1
       JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT 8`,
      [user.id]
    ),
  ]);

  return {
    tasks: all.rows[0],
    myTasks: mine.rows[0],
    upcomingDeadlines: upcoming.rows.map((task) => withPermissions(task, user)),
    projectProgress: progress.rows,
    recentActivity: activity.rows,
  };
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  listComments,
  addComment,
  getSummary,
};
