
const express = require("express");
const {
  create,
  list,
  getById,
  update,
  archive,
} = require("../controllers/projectController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

function requireProjectManager(req, res, next) {
  if (req.user.role !== "PROJECT_MANAGER") {
    return res.status(403).json({
      success: false,
      message: "Only Project Managers can manage projects.",
    });
  }

  next();
}

router.get("/", authenticateUser, list);
router.get("/:id", authenticateUser, getById);

router.post("/", authenticateUser, requireProjectManager, create);
router.put("/:id", authenticateUser, requireProjectManager, update);
router.patch(
  "/:id/archive",
  authenticateUser,
  requireProjectManager,
  archive
);

module.exports = router;