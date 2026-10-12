
const pool = require("../config/database");

async function createProject({ name, description, userId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `INSERT INTO projects (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, status, created_by,
                 created_at, updated_at`,
      [name, description, userId]
    );

    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2)`,
      [project.id, userId]
    );

    await client.query("COMMIT");

    return { ...project, member_count: 1 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listProjects(userId) {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.status,
       p.created_by,
       p.created_at,
       p.updated_at,
       COUNT(pm_all.user_id)::INTEGER AS member_count
     FROM projects p
     INNER JOIN project_members pm
       ON pm.project_id = p.id
      AND pm.user_id = $1
     LEFT JOIN project_members pm_all
       ON pm_all.project_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getProjectById(projectId, userId) {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.status,
       p.created_by,
       p.created_at,
       p.updated_at,
       COUNT(pm_all.user_id)::INTEGER AS member_count
     FROM projects p
     INNER JOIN project_members pm
       ON pm.project_id = p.id
      AND pm.user_id = $1
     LEFT JOIN project_members pm_all
       ON pm_all.project_id = p.id
     WHERE p.id = $2
     GROUP BY p.id`,
    [userId, projectId]
  );

  return result.rows[0] || null;
}

async function updateProjectById({
  projectId,
  userId,
  name,
  description,
}) {
  const result = await pool.query(
    `UPDATE projects AS p
     SET name = $1,
         description = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE p.id = $3
       AND EXISTS (
         SELECT 1
         FROM project_members AS pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $4
       )
       AND p.status = 'ACTIVE'
     RETURNING
       p.id,
       p.name,
       p.description,
       p.status,
       p.created_by,
       p.created_at,
       p.updated_at`,
    [name, description, projectId, userId]
  );

  return result.rows[0] || null;
}

async function archiveProjectById({ projectId, userId }) {
  const result = await pool.query(
    `UPDATE projects AS p
     SET status = 'ARCHIVED',
         updated_at = CURRENT_TIMESTAMP
     WHERE p.id = $1
       AND p.status = 'ACTIVE'
       AND EXISTS (
         SELECT 1
         FROM project_members AS pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $2
       )
     RETURNING
       p.id,
       p.name,
       p.description,
       p.status,
       p.created_by,
       p.created_at,
       p.updated_at`,
    [projectId, userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProjectById,
  archiveProjectById,
};
