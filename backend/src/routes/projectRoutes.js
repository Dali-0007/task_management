
const express = require("express");
const { create } = require("../controllers/projectController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

function requireProjectManager(req, res, next) {
  if (req.user.role !== "PROJECT_MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Only Project Managers can create projects.",
    });
  }

  next();
}

router.post("/", authenticateUser, requireProjectManager, create);

module.exports = router;
