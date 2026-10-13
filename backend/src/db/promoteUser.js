// Promotes one existing account to PROJECT_MANAGER, by email. Roles are not
// self-service in the app, so this is how the first manager is created.
//   npm run promote-manager -- someone@example.com
require("dotenv").config({ quiet: true });

const pool = require("../config/database");

async function promote(email) {
  if (!email) {
    throw new Error("Usage: npm run promote-manager -- <email>");
  }

  const result = await pool.query(
    `UPDATE users
     SET role = 'PROJECT_MANAGER'
     WHERE email = $1
     RETURNING id, name, email, role`,
    [email.trim().toLowerCase()]
  );

  if (!result.rowCount) {
    throw new Error(`No account found for ${email}. Sign up in the app first.`);
  }

  const user = result.rows[0];
  console.log(`${user.name} <${user.email}> is now ${user.role}.`);
}

promote(process.argv[2])
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
