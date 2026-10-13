
const bcrypt = require("bcrypt");
const pool = require("../config/database");

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error("Email is already registered.");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  return result.rows[0];
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, created_at
     FROM users
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const { password_hash, ...safeUser } = user;

  return safeUser;
}

// Only the display name can be changed here; role and email are not
// self-service fields.
async function updateUserName(userId, name) {
  const result = await pool.query(
    `UPDATE users
     SET name = $1
     WHERE id = $2
     RETURNING id, name, email, role, created_at`,
    [name, userId]
  );

  return result.rows[0] || null;
}

module.exports = { registerUser, loginUser, updateUserName };
