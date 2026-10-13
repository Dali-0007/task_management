// Applies pending SQL migrations in src/db/migrations in filename order.
// Each migration runs in its own transaction and is recorded in
// schema_migrations, so re-running is safe. Never drops or rewrites data.
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const applied = new Set(
      (await client.query("SELECT name FROM schema_migrations")).rows.map(
        (row) => row.name
      )
    );

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }
    }

    console.log("Database is up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
