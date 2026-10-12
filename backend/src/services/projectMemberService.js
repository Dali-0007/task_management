
const pool = require("../config/database");

async function listProjectMembers(projectId, userId) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, pm.added_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     JOIN projects p ON p.id = pm.project_id
     WHERE p.id = $1
       AND EXISTS (
         SELECT 1
         FROM project_members viewer
         WHERE viewer.project_id = p.id
           AND viewer.user_id = $2
       )
     ORDER BY u.name`,
    [projectId, userId]
  );

  return result.rows;
}

async function listAvailableUsers(projectId, search, managerId) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role
     FROM users u
     WHERE (u.name ILIKE $1 OR u.email ILIKE $1)
       AND NOT EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = $2
           AND pm.user_id = u.id
       )
       AND EXISTS (
         SELECT 1
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id
         WHERE p.id = $2
           AND p.status = 'ACTIVE'
           AND pm.user_id = $3
       )
       AND EXISTS (
         SELECT 1
         FROM users manager
         WHERE manager.id = $3
           AND manager.role = 'PROJECT_MANAGER'
       )
     ORDER BY u.name
     LIMIT 20`,
    [`%${search}%`, projectId, managerId]
  );

  return result.rows;
}

async function addProjectMember({ projectId, userId, managerId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const project = await client.query(
      `SELECT p.id
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1
         AND p.status = 'ACTIVE'
         AND pm.user_id = $2
         AND EXISTS (
           SELECT 1 FROM users u
           WHERE u.id = $2
             AND u.role = 'PROJECT_MANAGER'
         )
       FOR UPDATE OF p`,
      [projectId, managerId]
    );

    if (!project.rowCount) {
      const error = new Error(
        "Active project not found or you cannot manage its members."
      );
      error.statusCode = 404;
      throw error;
    }

    const user = await client.query(
      `SELECT id, name, email, role
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!user.rowCount) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    const membership = await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (project_id, user_id) DO NOTHING
       RETURNING added_at`,
      [projectId, userId]
    );

    if (!membership.rowCount) {
      const error = new Error("This user is already a project member.");
      error.statusCode = 409;
      throw error;
    }

    await client.query("COMMIT");

    return {
      ...user.rows[0],
      added_at: membership.rows[0].added_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function removeProjectMember({ projectId, userId, managerId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const project = await client.query(
      `SELECT p.id
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1
         AND p.status = 'ACTIVE'
         AND pm.user_id = $2
         AND EXISTS (
           SELECT 1 FROM users u
           WHERE u.id = $2
             AND u.role = 'PROJECT_MANAGER'
         )
       FOR UPDATE OF p`,
      [projectId, managerId]
    );

    if (!project.rowCount) {
      const error = new Error(
        "Active project not found or you cannot manage its members."
      );
      error.statusCode = 404;
      throw error;
    }

    if (String(userId) === String(managerId)) {
      const managers = await client.query(
        `SELECT COUNT(*)::INTEGER AS count
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         WHERE pm.project_id = $1
           AND u.role = 'PROJECT_MANAGER'`,
        [projectId]
      );

      if (managers.rows[0].count <= 1) {
        const error = new Error(
          "You cannot remove the last Project Manager from this project."
        );
        error.statusCode = 409;
        throw error;
      }
    }

    const result = await client.query(
      `DELETE FROM project_members
       WHERE project_id = $1 AND user_id = $2
       RETURNING project_id, user_id`,
      [projectId, userId]
    );

    if (!result.rowCount) {
      const error = new Error("Project member not found.");
      error.statusCode = 404;
      throw error;
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listProjectMembers,
  listAvailableUsers,
  addProjectMember,
  removeProjectMember,
};
