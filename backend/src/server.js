
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const projectMemberRoutes = require("./routes/projectMemberRoutes");
const taskRoutes = require("./routes/taskRoutes");
// Comma-separated list of exact frontend origins allowed to send cookies.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// API responses are per-user; never let a CDN or proxy cache them.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-membership", projectMemberRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Management API is running",
  });
});

app.get("/api/db-health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database(), current_user"
    );

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection successful",
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Last-resort handler: malformed JSON bodies get a 400, anything else a
// generic 500. Never send stack traces or internal messages to the client.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must be valid JSON.",
    });
  }

  console.error("Unhandled request error:", error.message);

  return res.status(error.status >= 400 && error.status < 500 ? error.status : 500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
