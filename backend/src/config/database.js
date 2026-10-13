const { Pool } = require("pg");

// Production (e.g. Neon) provides a single DATABASE_URL, which carries its own
// SSL settings such as `?sslmode=require`. Local development uses DB_* values.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

module.exports = pool;
