
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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-membership", projectMemberRoutes);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
