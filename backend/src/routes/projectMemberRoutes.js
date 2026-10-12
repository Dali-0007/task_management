
const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");

const {
  listMembers,
  listAvailable,
  addMember,
  removeMember,
} = require("../controllers/projectMemberController");

const router = express.Router();

// View members of a project
router.get("/:id/members", authenticateUser, listMembers);

// Search registered users who can be added
router.get(
  "/:id/available-users",
  authenticateUser,
  listAvailable
);

// Add a member to a project
router.post("/:id/members", authenticateUser, addMember);

// Remove a member from a project
router.delete(
  "/:id/members/:userId",
  authenticateUser,
  removeMember
);

module.exports = router;
